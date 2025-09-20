#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Blog configuration
const config = {
  postsDir: path.join(projectRoot, 'content/posts'),
  templatesDir: path.join(projectRoot, 'templates'),
  outputDir: path.join(projectRoot, 'blog'),
  baseUrl: 'https://costflowai.com',
  siteName: 'CostFlowAI',
  siteDescription: 'Professional construction cost calculators and estimation guides',
  postsPerPage: 10
};

// Get popular calculators from registry
function getPopularCalculators() {
  try {
    const registryPath = path.join(projectRoot, 'assets/js/calculators/registry.js');
    const registryContent = fs.readFileSync(registryPath, 'utf-8');

    // Extract calculator entries using regex
    const registryMatch = registryContent.match(/export const calculatorRegistry = \[([\s\S]*?)\];/);
    if (!registryMatch) {
      throw new Error('Could not find calculatorRegistry');
    }

    // Parse top 5 calculators
    const calculators = [];
    const calculatorMatches = registryMatch[1].matchAll(/\{[\s\S]*?id: ['"`](\w+)['"`][\s\S]*?description: ['"`](.*?)['"`][\s\S]*?\}/g);

    for (const match of calculatorMatches) {
      const [, id, description] = match;
      const name = id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, ' $1').trim() + ' Calculator';
      calculators.push({
        id: id.trim(),
        name: name,
        description: description.trim()
      });

      if (calculators.length >= 5) break;
    }

    return calculators;
  } catch (error) {
    console.warn('Could not load popular calculators:', error.message);
    return [
      { id: 'concrete', name: 'Concrete Calculator', description: 'Calculate concrete volume and materials' },
      { id: 'framing', name: 'Framing Calculator', description: 'Estimate lumber quantities and costs' },
      { id: 'drywall', name: 'Drywall Calculator', description: 'Calculate drywall sheets and materials' },
      { id: 'paint', name: 'Paint Calculator', description: 'Estimate paint quantities and coverage' },
      { id: 'roofing', name: 'Roofing Calculator', description: 'Calculate roofing materials and costs' }
    ];
  }
}

// Ensure output directories exist
function ensureDirectories() {
  const dirs = [
    config.outputDir,
    path.join(config.outputDir, 'tags'),
    path.dirname(path.join(projectRoot, 'rss.xml')),
    path.dirname(path.join(projectRoot, 'sitemap.xml'))
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Parse markdown files with frontmatter
function parsePosts() {
  const postsFiles = fs.readdirSync(config.postsDir)
    .filter(file => file.endsWith('.md'))
    .sort()
    .reverse(); // Newest first

  const posts = [];

  for (const file of postsFiles) {
    const filePath = path.join(config.postsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // Parse markdown content
    const htmlContent = marked(content);

    // Generate excerpt if not provided
    const excerpt = data.description || content.split('\n\n')[0].replace(/[#*`]/g, '').substring(0, 160) + '...';

    const post = {
      ...data,
      content: htmlContent,
      excerpt,
      filename: file,
      slug: data.slug || path.basename(file, '.md'),
      url: `/blog/${data.slug || path.basename(file, '.md')}`,
      date_iso: new Date(data.date).toISOString(),
      date_formatted: new Date(data.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      tags: data.tags || [],
      cover: data.cover || null
    };

    posts.push(post);
  }

  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Load template files
function loadTemplates() {
  const postTemplate = fs.readFileSync(path.join(config.templatesDir, 'post.html'), 'utf-8');
  const indexTemplate = fs.readFileSync(path.join(config.templatesDir, 'blog_index.html'), 'utf-8');

  return { postTemplate, indexTemplate };
}

// Simple templating function
function renderTemplate(template, data) {
  let result = template;

  // Handle each blocks {{#each items}}
  result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, content) => {
    const array = data[arrayName] || [];
    return array.map(item => renderTemplate(content, { ...data, ...item })).join('');
  });

  // Handle if blocks {{#if condition}}
  result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
    return data[condition] ? renderTemplate(content, data) : '';
  });

  // Handle simple variables {{variable}}
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : '';
  });

  return result;
}

// Generate individual post pages
function generatePostPages(posts, templates) {
  const popularCalculators = getPopularCalculators();

  posts.forEach((post, index) => {
    const prevPost = index < posts.length - 1 ? posts[index + 1] : null;
    const nextPost = index > 0 ? posts[index - 1] : null;

    // Find related posts (same tags)
    const relatedPosts = posts
      .filter(p => p.slug !== post.slug && p.tags.some(tag => post.tags.includes(tag)))
      .slice(0, 3);

    const templateData = {
      ...post,
      post_content: post.content,
      canonical_url: `${config.baseUrl}${post.url}`,
      tags_string: post.tags.join(', '),
      prev_post: prevPost,
      next_post: nextPost,
      related_posts: relatedPosts,
      popular_calculators: popularCalculators,
      nonce: 'PLACEHOLDER_NONCE'
    };

    const html = renderTemplate(templates.postTemplate, templateData);
    const outputPath = path.join(config.outputDir, post.slug, 'index.html');

    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, html);
    console.log(`Generated: ${outputPath}`);
  });
}

// Generate blog index page with pagination
function generateBlogIndex(posts, templates) {
  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / config.postsPerPage);

  // Get all tags
  const allTags = [...new Set(posts.flatMap(post => post.tags))];
  const popularCalculators = getPopularCalculators();
  const recentPosts = posts.slice(0, 5);

  // Generate main blog index (page 1)
  generateBlogPage(1, posts, templates, {
    page_title: 'Construction Cost Estimation Blog',
    page_description: 'Expert guides, tutorials, and insights on construction cost estimation, calculators, and industry best practices.',
    canonical_url: `${config.baseUrl}/blog`,
    all_tags: allTags,
    popular_calculators: popularCalculators,
    recent_posts: recentPosts,
    totalPages
  });

  // Generate additional pages if needed
  if (totalPages > 1) {
    for (let page = 2; page <= totalPages; page++) {
      generateBlogPage(page, posts, templates, {
        page_title: `Construction Cost Estimation Blog - Page ${page}`,
        page_description: 'Expert guides, tutorials, and insights on construction cost estimation, calculators, and industry best practices.',
        canonical_url: `${config.baseUrl}/blog/page/${page}`,
        all_tags: allTags,
        popular_calculators: popularCalculators,
        recent_posts: recentPosts,
        totalPages
      });
    }
  }
}

// Generate individual blog page
function generateBlogPage(currentPage, allPosts, templates, pageData) {
  const startIndex = (currentPage - 1) * config.postsPerPage;
  const endIndex = startIndex + config.postsPerPage;
  const posts = allPosts.slice(startIndex, endIndex);

  // Build pagination data
  const pagination = pageData.totalPages > 1 ? {
    current_page: currentPage,
    total_pages: pageData.totalPages,
    prev_url: currentPage > 1 ? (currentPage === 2 ? '/blog' : `/blog/page/${currentPage - 1}`) : null,
    next_url: currentPage < pageData.totalPages ? `/blog/page/${currentPage + 1}` : null,
    pages: Array.from({ length: pageData.totalPages }, (_, i) => ({
      page: i + 1,
      url: i === 0 ? '/blog' : `/blog/page/${i + 1}`,
      current: i + 1 === currentPage
    }))
  } : null;

  const templateData = {
    ...pageData,
    posts,
    pagination,
    nonce: 'PLACEHOLDER_NONCE'
  };

  const html = renderTemplate(templates.indexTemplate, templateData);

  // Determine output path
  let outputPath;
  if (currentPage === 1) {
    outputPath = path.join(config.outputDir, 'index.html');
    console.log('Generated: blog/index.html');
  } else {
    const pageDir = path.join(config.outputDir, 'page', currentPage.toString());
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }
    outputPath = path.join(pageDir, 'index.html');
    console.log(`Generated: blog/page/${currentPage}/index.html`);
  }

  fs.writeFileSync(outputPath, html);
}

// Generate tag pages
function generateTagPages(posts, templates) {
  const tags = [...new Set(posts.flatMap(post => post.tags))];

  tags.forEach(tag => {
    const tagPosts = posts.filter(post => post.tags.includes(tag));
    const allTags = [...new Set(posts.flatMap(post => post.tags))];

    const categories = allTags.map(t => ({
      name: t,
      slug: t,
      count: posts.filter(post => post.tags.includes(t)).length,
      current: t === tag
    }));

    const templateData = {
      page_title: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Posts`,
      page_description: `Construction cost estimation guides and tutorials about ${tag}.`,
      canonical_url: `${config.baseUrl}/blog/tags/${tag}`,
      posts: tagPosts,
      categories,
      popular_posts: posts.slice(0, 5),
      is_tag_page: true,
      current_tag: tag,
      nonce: 'blog-script-nonce'
    };

    const html = renderTemplate(templates.indexTemplate, templateData);
    const outputPath = path.join(config.outputDir, 'tags', tag, 'index.html');

    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, html);
    console.log(`Generated: blog/tags/${tag}/index.html`);
  });
}

// Generate RSS feed
function generateRSS(posts) {
  const rssItems = posts.slice(0, 10).map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description || post.excerpt}]]></description>
      <link>${config.baseUrl}${post.url}</link>
      <guid>${config.baseUrl}${post.url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>noreply@costflowai.com (CostFlowAI Team)</author>
      ${post.tags.map(tag => `<category>${tag}</category>`).join('')}
    </item>
  `).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CostFlowAI Blog</title>
    <description>Professional construction cost estimation guides and tutorials</description>
    <link>${config.baseUrl}/blog</link>
    <atom:link href="${config.baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>CostFlowAI Blog Generator</generator>
    ${rssItems}
  </channel>
</rss>`;

  fs.writeFileSync(path.join(projectRoot, 'rss.xml'), rss);
  console.log('Generated: rss.xml');
}

// Generate sitemap
function generateSitemap(posts) {
  const postUrls = posts.map(post => `
  <url>
    <loc>${config.baseUrl}${post.url}</loc>
    <lastmod>${post.date_iso.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

  const tags = [...new Set(posts.flatMap(post => post.tags))];
  const tagUrls = tags.map(tag => `
  <url>
    <loc>${config.baseUrl}/blog/tags/${tag}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${config.baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${config.baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${config.baseUrl}/calculators</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  ${postUrls}
  ${tagUrls}
</urlset>`;

  fs.writeFileSync(path.join(projectRoot, 'sitemap.xml'), sitemap);
  console.log('Generated: sitemap.xml');
}

// Generate robots.txt
function generateRobots() {
  const robots = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${config.baseUrl}/sitemap.xml

# Disallow admin and private paths
Disallow: /admin/
Disallow: /private/
Disallow: /.git/
Disallow: /node_modules/
Disallow: /tools/

# Allow important paths
Allow: /blog/
Allow: /calculators/
Allow: /assets/`;

  fs.writeFileSync(path.join(projectRoot, 'robots.txt'), robots);
  console.log('Generated: robots.txt');
}

// Main build function
async function buildBlog() {
  console.log('Building CostFlowAI Blog...');

  try {
    // Ensure directories exist
    ensureDirectories();

    // Parse posts
    console.log('Parsing posts...');
    const posts = parsePosts();
    console.log(`Found ${posts.length} posts`);

    // Load templates
    console.log('Loading templates...');
    const templates = loadTemplates();

    // Generate pages
    console.log('Generating post pages...');
    generatePostPages(posts, templates);

    console.log('Generating blog index...');
    generateBlogIndex(posts, templates);

    console.log('Generating tag pages...');
    generateTagPages(posts, templates);

    console.log('Generating RSS feed...');
    generateRSS(posts);

    console.log('Generating sitemap...');
    generateSitemap(posts);

    console.log('Generating robots.txt...');
    generateRobots();

    console.log('✅ Blog build completed successfully!');
    console.log(`📁 Output: ${config.outputDir}`);
    console.log(`🌐 Blog URL: ${config.baseUrl}/blog`);

  } catch (error) {
    console.error('❌ Blog build failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('build_blog.mjs')) {
  buildBlog();
}

export { buildBlog };