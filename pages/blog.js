import Head from 'next/head';
import Link from 'next/link';

export default function Blog() {
  const blogPosts = [
    {
      slug: 'concrete-calculator-guide',
      title: 'Complete Guide to Concrete Calculation',
      excerpt: 'Learn how to accurately calculate concrete volume, materials, and costs for your construction projects.',
      date: '2024-01-15'
    },
    {
      slug: 'drywall-estimation-guide',
      title: 'Drywall Estimation Best Practices',
      excerpt: 'Master drywall estimation with professional tips for calculating sheets, mud, and labor costs.',
      date: '2024-01-12'
    },
    {
      slug: 'construction-cost-factors',
      title: 'Key Factors Affecting Construction Costs',
      excerpt: 'Understanding regional pricing, material fluctuations, and labor costs in construction estimation.',
      date: '2024-01-10'
    }
  ];

  return (
    <>
      <Head>
        <title>Construction Blog - CostFlowAI</title>
        <meta name="description" content="Expert insights, guides, and tips for construction cost estimation and project management." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <nav className="nav-header">
        <Link href="/">Home</Link>
        <Link href="/calculators">Calculators</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact</Link>
      </nav>

      <main className="container">
        <section className="hero">
          <h1>Construction Insights & Guides</h1>
          <p>Expert insights and practical guides for construction professionals</p>
        </section>

        <section className="blog-posts">
          <div className="posts-grid">
            {blogPosts.map((post) => (
              <article key={post.slug} className="post-card">
                <h2>{post.title}</h2>
                <p className="post-excerpt">{post.excerpt}</p>
                <div className="post-meta">
                  <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
                </div>
                <Link href={`/blog/${post.slug}`} className="btn-secondary">
                  Read More
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}