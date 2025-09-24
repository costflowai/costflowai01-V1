import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { getAllBlogPosts, getFeaturedBlogPosts } from '../data/blogPosts';

export default function Blog() {
  const allPosts = getAllBlogPosts();
  const featuredPosts = getFeaturedBlogPosts();

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
          <h1>Insights from CostFlowAI</h1>
          <p>Building the future of construction intelligence</p>
        </section>

        {featuredPosts.length > 0 && (
          <section className="featured-posts" style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '30px', color: '#333' }}>Featured</h2>
            {featuredPosts.map((post) => (
              <article key={post.slug} className="featured-post" style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '12px',
                padding: '40px',
                marginBottom: '30px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px', alignItems: 'center' }}>
                  <div>
                    <div className="post-meta" style={{ marginBottom: '15px' }}>
                      <span className="category" style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginRight: '15px'
                      }}>
                        {post.category}
                      </span>
                      <time dateTime={post.publishDate} style={{ color: '#666', fontSize: '14px' }}>
                        {new Date(post.publishDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                      <span style={{ color: '#666', fontSize: '14px', marginLeft: '15px' }}>
                        {post.readTime} min read
                      </span>
                    </div>
                    <h2 style={{ fontSize: '32px', lineHeight: '1.2', marginBottom: '15px', color: '#333' }}>
                      {post.title}
                    </h2>
                    <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#666', marginBottom: '25px' }}>
                      {post.excerpt}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        marginRight: '12px'
                      }}>
                        CT
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>{post.author.name}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>{post.author.bio}</div>
                      </div>
                    </div>
                    <Link href={`/blog/${post.slug}`} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      transition: 'background-color 0.3s'
                    }}>
                      Read Full Article →
                    </Link>
                  </div>
                  <div>
                    <Image
                      src="/images/blog/placeholder.svg"
                      alt={post.image?.alt || post.title}
                      width={400}
                      height={200}
                      style={{ borderRadius: '8px', width: '100%', height: 'auto' }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="all-posts">
          <h2 style={{ fontSize: '28px', marginBottom: '30px', color: '#333' }}>Latest Articles</h2>
          <div className="posts-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '30px'
          }}>
            {allPosts.filter(post => !post.featured).map((post) => (
              <article key={post.slug} className="post-card" style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e9ecef',
                transition: 'transform 0.3s, box-shadow 0.3s'
              }}>
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <Image
                    src="/images/blog/placeholder.svg"
                    alt={post.image?.alt || post.title}
                    width={400}
                    height={200}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '25px' }}>
                  <div className="post-meta" style={{ marginBottom: '15px' }}>
                    <span className="category" style={{
                      background: '#4CAF50',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginRight: '10px'
                    }}>
                      {post.category}
                    </span>
                    <time dateTime={post.publishDate} style={{ color: '#666', fontSize: '14px' }}>
                      {new Date(post.publishDate).toLocaleDateString()}
                    </time>
                    <span style={{ color: '#666', fontSize: '14px', marginLeft: '10px' }}>
                      • {post.readTime} min
                    </span>
                  </div>
                  <h3 style={{ fontSize: '20px', lineHeight: '1.3', marginBottom: '12px', color: '#333' }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#666', marginBottom: '20px' }}>
                    {post.excerpt}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        marginRight: '8px'
                      }}>
                        CT
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>{post.author.name}</div>
                    </div>
                    <Link href={`/blog/${post.slug}`} style={{
                      color: '#4CAF50',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}