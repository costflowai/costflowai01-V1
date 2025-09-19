#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Search configuration
const config = {
  postsDir: path.join(projectRoot, 'content/posts'),
  outputPath: path.join(projectRoot, 'assets/data/search.json'),
  calculatorsDir: path.join(projectRoot, 'calculators'),
  maxExcerptLength: 200
};

// Create excerpt from content
function createExcerpt(content, maxLength = config.maxExcerptLength) {
  // Remove markdown syntax and HTML tags
  const cleaned = content
    .replace(/#{1,6}\s+/g, '') // Remove markdown headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Find the last complete word within the limit
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > maxLength * 0.8
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

// Extract searchable content from markdown
function extractSearchableContent(content) {
  // Remove frontmatter if present
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');

  // Extract headings for boosted search relevance
  const headings = [];
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(withoutFrontmatter)) !== null) {
    headings.push(match[1].trim());
  }

  return {
    headings: headings.join(' '),
    content: withoutFrontmatter
  };
}

// Parse blog posts for search index
function parseBlogPosts() {
  if (!fs.existsSync(config.postsDir)) {
    console.log('No blog posts directory found, skipping...');
    return [];
  }

  const postsFiles = fs.readdirSync(config.postsDir)
    .filter(file => file.endsWith('.md'));

  const posts = [];

  for (const file of postsFiles) {
    try {
      const filePath = path.join(config.postsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      const searchableContent = extractSearchableContent(content);
      const excerpt = data.description || createExcerpt(content);

      const searchItem = {
        id: `post-${data.slug || path.basename(file, '.md')}`,
        type: 'blog',
        title: data.title || 'Untitled Post',
        excerpt: excerpt,
        content: searchableContent.content,
        headings: searchableContent.headings,
        url: `/blog/${data.slug || path.basename(file, '.md')}`,
        tags: data.tags || [],
        date: data.date || new Date().toISOString(),
        category: 'Blog Post'
      };

      posts.push(searchItem);
    } catch (error) {
      console.warn(`Warning: Failed to parse ${file}:`, error.message);
    }
  }

  return posts;
}

// Parse calculator pages for search index
function parseCalculatorPages() {
  const calculatorInfo = [
    {
      id: 'calc-concrete',
      title: 'Concrete Slab Pro Calculator',
      excerpt: 'Calculate concrete volume, rebar requirements, and total project costs for concrete slabs with regional pricing.',
      content: 'concrete slab calculator volume cubic yards rebar grid layout regional pricing labor costs materials waste factor delivery pump',
      headings: 'Concrete Slab Calculator Professional Materials Labor',
      url: '/calculators/concrete',
      tags: ['concrete', 'structural', 'rebar', 'volume'],
      category: 'Calculator'
    },
    {
      id: 'calc-drywall',
      title: 'Drywall Calculator',
      excerpt: 'Calculate drywall sheets, mud, tape, and finishing materials for interior construction projects.',
      content: 'drywall calculator sheets mud tape finishing materials interior construction square footage',
      headings: 'Drywall Calculator Materials Finishing',
      url: '/calculators/drywall',
      tags: ['drywall', 'interior', 'finishing'],
      category: 'Calculator'
    },
    {
      id: 'calc-paint',
      title: 'Paint Calculator',
      excerpt: 'Estimate paint quantities, primer, and coating materials for interior and exterior surfaces.',
      content: 'paint calculator primer coating materials interior exterior surfaces coverage gallons',
      headings: 'Paint Calculator Coverage Materials',
      url: '/calculators/paint',
      tags: ['paint', 'coating', 'interior', 'exterior'],
      category: 'Calculator'
    },
    {
      id: 'calc-earthwork',
      title: 'Earthwork Calculator',
      excerpt: 'Calculate cut/fill volumes, truckloads, and haul distances for earthwork and excavation projects.',
      content: 'earthwork calculator cut fill excavation volume truckloads haul distance cubic yards grading',
      headings: 'Earthwork Calculator Cut Fill Excavation',
      url: '/calculators/earthwork',
      tags: ['earthwork', 'excavation', 'grading', 'sitework'],
      category: 'Calculator'
    },
    {
      id: 'calc-masonry',
      title: 'Masonry Calculator',
      excerpt: 'Calculate CMU blocks, bricks, mortar bags, and rebar requirements for masonry construction.',
      content: 'masonry calculator CMU blocks bricks mortar bags rebar construction wall square footage',
      headings: 'Masonry Calculator Blocks Bricks Mortar',
      url: '/calculators/masonry',
      tags: ['masonry', 'CMU', 'brick', 'mortar', 'structural'],
      category: 'Calculator'
    },
    {
      id: 'calc-insulation',
      title: 'Insulation Calculator',
      excerpt: 'Calculate batt, blown, and rigid insulation materials with R-value calculations by assembly type.',
      content: 'insulation calculator batt blown rigid R-value thermal resistance assembly walls ceiling',
      headings: 'Insulation Calculator R-Value Thermal',
      url: '/calculators/insulation',
      tags: ['insulation', 'R-value', 'thermal', 'energy'],
      category: 'Calculator'
    },
    {
      id: 'calc-siteconcrete',
      title: 'Site Concrete Calculator',
      excerpt: 'Calculate concrete volume and materials for curbs, sidewalks, and site concrete elements.',
      content: 'site concrete calculator curbs sidewalks volume materials linear feet cubic yards',
      headings: 'Site Concrete Calculator Curbs Sidewalks',
      url: '/calculators/siteconcrete',
      tags: ['concrete', 'sitework', 'curbs', 'sidewalks'],
      category: 'Calculator'
    }
  ];

  return calculatorInfo.map(calc => ({
    ...calc,
    date: new Date().toISOString()
  }));
}

// Parse static pages for search index
function parseStaticPages() {
  const staticPages = [
    {
      id: 'page-home',
      title: 'CostFlowAI - Professional Construction Cost Calculators',
      excerpt: 'Professional construction cost estimation tools powered by real-time regional pricing data.',
      content: 'construction cost estimation calculators professional regional pricing real-time data',
      headings: 'Professional Construction Cost Calculators',
      url: '/',
      tags: ['home', 'calculators', 'construction'],
      category: 'Page'
    },
    {
      id: 'page-calculators',
      title: 'Construction Calculators - CostFlowAI',
      excerpt: 'Comprehensive suite of construction cost calculators for structural, MEP, finishes, and sitework.',
      content: 'construction calculators structural MEP finishes sitework comprehensive suite cost estimation',
      headings: 'Construction Calculators Structural MEP Finishes',
      url: '/calculators',
      tags: ['calculators', 'tools', 'construction'],
      category: 'Page'
    }
  ];

  return staticPages.map(page => ({
    ...page,
    date: new Date().toISOString()
  }));
}

// Build complete search index
function buildSearchIndex() {
  console.log('Building search index...');

  const searchItems = [
    ...parseBlogPosts(),
    ...parseCalculatorPages(),
    ...parseStaticPages()
  ];

  // Sort by relevance (calculators first, then recent blog posts)
  searchItems.sort((a, b) => {
    if (a.type === 'calculator' && b.type !== 'calculator') return -1;
    if (a.type !== 'calculator' && b.type === 'calculator') return 1;

    // For same types, sort by date (newest first)
    return new Date(b.date) - new Date(a.date);
  });

  const searchIndex = {
    version: '1.0',
    generated: new Date().toISOString(),
    count: searchItems.length,
    items: searchItems
  };

  // Ensure output directory exists
  const outputDir = path.dirname(config.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write search index
  fs.writeFileSync(config.outputPath, JSON.stringify(searchIndex, null, 2));

  console.log(`✅ Search index generated: ${config.outputPath}`);
  console.log(`📊 Indexed ${searchItems.length} items:`);

  const typeCounts = searchItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count} items`);
  });

  return searchIndex;
}

// Main function
function main() {
  try {
    buildSearchIndex();
    console.log('🔍 Search index build completed successfully!');
  } catch (error) {
    console.error('❌ Search index build failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('build_search_index.mjs')) {
  main();
}

export { buildSearchIndex };