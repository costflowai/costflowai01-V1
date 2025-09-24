import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

export default function BlogPostLayout({ post }) {
  if (!post) return null;

  return (
    <>
      <Head>
        <title>{post.seo.metaTitle}</title>
        <meta name="description" content={post.seo.metaDescription} />
        <meta name="keywords" content={post.seo.keywords.join(', ')} />
        <link rel="canonical" href={post.seo.canonicalUrl} />

        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={post.seo.canonicalUrl} />
        <meta property="og:image" content={`https://costflowai.com${post.image.url}`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={`https://costflowai.com${post.image.url}`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": post.title,
              "description": post.excerpt,
              "image": `https://costflowai.com${post.image.url}`,
              "author": {
                "@type": "Person",
                "name": post.author.name,
                "jobTitle": post.author.bio
              },
              "publisher": {
                "@type": "Organization",
                "name": "CostFlowAI",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://costflowai.com/icon-192.png"
                }
              },
              "datePublished": post.publishDate,
              "dateModified": post.lastModified,
              "mainEntityOfPage": post.seo.canonicalUrl
            })
          }}
        />
      </Head>

      <div className="blog-post-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <nav style={{ marginBottom: '30px', fontSize: '14px', color: '#666' }}>
          <Link href="/" style={{ color: '#4CAF50', textDecoration: 'none' }}>Home</Link>
          {' › '}
          <Link href="/blog" style={{ color: '#4CAF50', textDecoration: 'none' }}>Blog</Link>
          {' › '}
          <span>{post.title}</span>
        </nav>

        <article>
          {/* Hero Image */}
          <div style={{ marginBottom: '40px', borderRadius: '12px', overflow: 'hidden' }}>
            <Image
              src="/images/blog/placeholder.svg"
              alt={post.image.alt}
              width={800}
              height={400}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            {post.image.caption && (
              <p style={{
                fontSize: '14px',
                color: '#666',
                fontStyle: 'italic',
                textAlign: 'center',
                margin: '10px 0 0 0',
                padding: '0 20px'
              }}>
                {post.image.caption}
              </p>
            )}
          </div>

          {/* Article Header */}
          <header style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{
                background: '#4CAF50',
                color: 'white',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                marginRight: '15px'
              }}>
                {post.category}
              </span>
              {post.tags.map(tag => (
                <span key={tag} style={{
                  background: '#f8f9fa',
                  color: '#495057',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  marginRight: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  {tag}
                </span>
              ))}
            </div>

            <h1 style={{
              fontSize: '42px',
              lineHeight: '1.2',
              marginBottom: '20px',
              color: '#333',
              fontWeight: '700'
            }}>
              {post.title}
            </h1>

            <p style={{
              fontSize: '20px',
              lineHeight: '1.6',
              color: '#666',
              marginBottom: '30px',
              fontWeight: '400'
            }}>
              {post.excerpt}
            </p>

            {/* Author Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '24px',
                marginRight: '16px'
              }}>
                CT
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 'bold',
                  color: '#333',
                  fontSize: '18px',
                  marginBottom: '4px'
                }}>
                  {post.author.name}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  {post.author.bio}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#999',
                  display: 'flex',
                  gap: '15px'
                }}>
                  <time dateTime={post.publishDate}>
                    {new Date(post.publishDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <span>•</span>
                  <span>{post.readTime} min read</span>
                </div>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <div className="blog-content" style={{
            fontSize: '18px',
            lineHeight: '1.7',
            color: '#333'
          }}>
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 style={{
                    fontSize: '36px',
                    marginTop: '60px',
                    marginBottom: '30px',
                    color: '#333',
                    fontWeight: '700',
                    lineHeight: '1.2'
                  }}>
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 style={{
                    fontSize: '28px',
                    marginTop: '50px',
                    marginBottom: '25px',
                    color: '#333',
                    fontWeight: '600',
                    lineHeight: '1.3'
                  }}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 style={{
                    fontSize: '24px',
                    marginTop: '40px',
                    marginBottom: '20px',
                    color: '#333',
                    fontWeight: '600'
                  }}>
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p style={{
                    marginBottom: '25px',
                    lineHeight: '1.7'
                  }}>
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul style={{
                    marginBottom: '25px',
                    paddingLeft: '30px',
                    lineHeight: '1.7'
                  }}>
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li style={{ marginBottom: '10px' }}>{children}</li>
                ),
                strong: ({ children }) => (
                  <strong style={{ fontWeight: '600', color: '#333' }}>{children}</strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote style={{
                    borderLeft: '4px solid #4CAF50',
                    paddingLeft: '20px',
                    marginLeft: '0',
                    marginBottom: '25px',
                    fontStyle: 'italic',
                    color: '#666',
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '0 8px 8px 0'
                  }}>
                    {children}
                  </blockquote>
                ),
                hr: () => (
                  <hr style={{
                    border: 'none',
                    height: '1px',
                    background: '#dee2e6',
                    margin: '50px 0'
                  }} />
                )
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Article Footer */}
          <footer style={{
            marginTop: '60px',
            paddingTop: '40px',
            borderTop: '2px solid #f8f9fa'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
              borderRadius: '12px',
              padding: '30px',
              color: 'white',
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '24px' }}>
                Ready to transform your construction estimation?
              </h3>
              <p style={{ margin: '0 0 25px 0', opacity: '0.9' }}>
                Join thousands of contractors using CostFlowAI for precise, intelligent cost estimation.
              </p>
              <Link href="/calculators" style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'white',
                color: '#4CAF50',
                padding: '15px 30px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                Try Our Calculators →
              </Link>
            </div>

            <nav style={{ textAlign: 'center' }}>
              <Link href="/blog" style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: '#4CAF50',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                ← Back to All Articles
              </Link>
            </nav>
          </footer>
        </article>
      </div>
    </>
  );
}