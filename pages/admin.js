import Head from 'next/head';
import { useState, useEffect } from 'react';
import { getAllBlogPosts } from '../data/blogPosts';

export default function BlogAdmin() {
  const [posts] = useState(getAllBlogPosts());
  const [selectedPost, setSelectedPost] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [showNewArticle, setShowNewArticle] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Construction Guide',
    featured: false,
    author: {
      name: 'CostFlowAI Team',
      bio: 'Construction Intelligence Experts',
      avatar: '/images/authors/costflowai-team.jpg'
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      canonicalUrl: ''
    }
  });

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('admin_token');
    const email = localStorage.getItem('admin_email');
    if (token && email) {
      verifyToken(token, email);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          action: 'login'
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_email', loginEmail);
        setIsAuthenticated(true);
        setLoginMessage('Login successful!');
      } else {
        setLoginMessage(data.message);
      }
    } catch (error) {
      setLoginMessage('Login failed. Please try again.');
    }
  };

  const verifyToken = async (token, email) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          token: token,
          action: 'verify'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_email');
        setIsAuthenticated(false);
      }
    } catch (error) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_email');
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    setIsAuthenticated(false);
    setLoginEmail('');
    setLoginMessage('');
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Admin Login - CostFlowAI</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>

        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            maxWidth: '400px',
            width: '100%',
            margin: '20px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ color: '#333', marginBottom: '10px', fontSize: '24px' }}>
                CostFlowAI Admin
              </h1>
              <p style={{ color: '#666', margin: '0' }}>
                Secure access for authorized personnel only
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#333',
                  fontWeight: 'bold'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e1e5e9',
                    borderRadius: '6px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginBottom: '20px'
                }}
              >
                Login
              </button>

              {loginMessage && (
                <div style={{
                  padding: '12px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '14px',
                  background: loginMessage.includes('successful') ? '#d4edda' : '#f8d7da',
                  color: loginMessage.includes('successful') ? '#155724' : '#721c24',
                  border: `1px solid ${loginMessage.includes('successful') ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                  {loginMessage}
                </div>
              )}
            </form>

            <div style={{
              marginTop: '30px',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#666'
            }}>
              <strong>Security Notice:</strong> This admin panel is restricted to authorized CostFlowAI personnel only.
              Access requires the registered admin email address.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Blog Management - CostFlowAI</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <header style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h1 style={{ color: '#333', fontSize: '32px', marginBottom: '10px', margin: 0 }}>
                CostFlowAI Blog Management
              </h1>
              <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
                Professional blogging platform for construction intelligence insights
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowNewArticle(true)}
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                + New Article
              </button>
              <button
                onClick={handleLogout}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
          {/* Blog Posts List */}
          <div>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Published Articles</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  style={{
                    padding: '20px',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedPost?.id === post.id ? '#e3f2fd' : 'white',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{
                      background: post.featured ? '#4CAF50' : '#f8f9fa',
                      color: post.featured ? 'white' : '#333',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginRight: '10px'
                    }}>
                      {post.featured ? 'Featured' : post.category}
                    </span>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {post.readTime} min read
                    </span>
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    margin: '0 0 8px 0',
                    color: '#333',
                    lineHeight: '1.3'
                  }}>
                    {post.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    margin: '0',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {post.excerpt}
                  </p>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
                    Published: {new Date(post.publishDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '30px',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{ color: '#333', margin: '0 0 15px 0' }}>How to Add New Articles</h3>
              <ol style={{ fontSize: '14px', color: '#666', paddingLeft: '20px' }}>
                <li>Edit <code>/data/blogPosts.js</code> to add new articles</li>
                <li>Follow the existing data structure with all required fields</li>
                <li>Set <code>featured: true</code> for homepage display</li>
                <li>Add images to <code>/public/images/blog/</code></li>
                <li>Deploy to see changes live</li>
              </ol>
            </div>
          </div>

          {/* Article Preview */}
          <div>
            {selectedPost ? (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h2 style={{ color: '#333', margin: 0 }}>Article Preview</h2>
                  <a
                    href={`/blog/${selectedPost.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#4CAF50',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontSize: '14px'
                    }}
                  >
                    View Live →
                  </a>
                </div>

                <div style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  {/* Article Header */}
                  <div style={{ padding: '30px', background: 'white' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <span style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginRight: '10px'
                      }}>
                        {selectedPost.category}
                      </span>
                      {selectedPost.featured && (
                        <span style={{
                          background: '#ff9800',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          Featured
                        </span>
                      )}
                    </div>

                    <h1 style={{
                      fontSize: '28px',
                      lineHeight: '1.2',
                      marginBottom: '15px',
                      color: '#333'
                    }}>
                      {selectedPost.title}
                    </h1>

                    <p style={{
                      fontSize: '16px',
                      lineHeight: '1.5',
                      color: '#666',
                      marginBottom: '20px'
                    }}>
                      {selectedPost.excerpt}
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
                        fontSize: '16px',
                        marginRight: '12px'
                      }}>
                        CF
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>
                          {selectedPost.author.name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          {selectedPost.author.bio}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      fontSize: '14px',
                      color: '#999',
                      display: 'flex',
                      gap: '15px'
                    }}>
                      <span>Published: {new Date(selectedPost.publishDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{selectedPost.readTime} min read</span>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div style={{ padding: '30px', background: '#f8f9fa' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Content Preview</h3>
                    <div style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      maxHeight: '300px',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {selectedPost.content.substring(0, 1000)}...
                    </div>
                  </div>

                  {/* SEO Info */}
                  <div style={{ padding: '30px', background: '#e3f2fd' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#1976d2' }}>SEO Information</h3>
                    <div style={{ fontSize: '14px' }}>
                      <p><strong>Meta Title:</strong> {selectedPost.seo.metaTitle}</p>
                      <p><strong>Meta Description:</strong> {selectedPost.seo.metaDescription}</p>
                      <p><strong>Keywords:</strong> {selectedPost.seo.keywords.join(', ')}</p>
                      <p><strong>Canonical URL:</strong> {selectedPost.seo.canonicalUrl}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '60px',
                textAlign: 'center',
                color: '#666',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <h3>Select an article to preview</h3>
                <p>Click on any article from the list to see its details and preview.</p>
              </div>
            )}
          </div>
        </div>

        {/* New Article Modal */}
        {showNewArticle && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '30px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>Create New Article</h2>
                <button
                  onClick={() => setShowNewArticle(false)}
                  style={{
                    background: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: '#666'
                  }}
                >
                  ×
                </button>
              </div>

              <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                      Article Title *
                    </label>
                    <input
                      type="text"
                      value={newArticle.title}
                      onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                      placeholder="Enter article title"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e1e5e9',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                      Category
                    </label>
                    <select
                      value={newArticle.category}
                      onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e1e5e9',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Construction Guide">Construction Guide</option>
                      <option value="Calculator Tips">Calculator Tips</option>
                      <option value="Industry Insights">Industry Insights</option>
                      <option value="Cost Analysis">Cost Analysis</option>
                      <option value="Material Guide">Material Guide</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    Article Excerpt *
                  </label>
                  <textarea
                    value={newArticle.excerpt}
                    onChange={(e) => setNewArticle({...newArticle, excerpt: e.target.value})}
                    placeholder="Brief description of the article (2-3 sentences)"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    Article Content *
                  </label>
                  <textarea
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                    placeholder="Full article content (supports markdown)"
                    rows={12}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical',
                      fontFamily: 'Monaco, Consolas, monospace',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                      SEO Meta Title
                    </label>
                    <input
                      type="text"
                      value={newArticle.seo.metaTitle}
                      onChange={(e) => setNewArticle({
                        ...newArticle,
                        seo: {...newArticle.seo, metaTitle: e.target.value}
                      })}
                      placeholder="SEO optimized title"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e1e5e9',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '30px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newArticle.featured}
                        onChange={(e) => setNewArticle({...newArticle, featured: e.target.checked})}
                        style={{ width: '20px', height: '20px' }}
                      />
                      <span style={{ fontWeight: 'bold', color: '#333' }}>Featured Article</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    SEO Meta Description
                  </label>
                  <textarea
                    value={newArticle.seo.metaDescription}
                    onChange={(e) => setNewArticle({
                      ...newArticle,
                      seo: {...newArticle.seo, metaDescription: e.target.value}
                    })}
                    placeholder="SEO meta description (150-160 characters)"
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e1e5e9',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    Image Upload
                  </label>
                  <div style={{
                    border: '2px dashed #e1e5e9',
                    borderRadius: '6px',
                    padding: '40px',
                    textAlign: 'center',
                    background: '#f8f9fa'
                  }}>
                    <div style={{ marginBottom: '15px', fontSize: '48px', color: '#ccc' }}>📁</div>
                    <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                      Drag and drop images here, or click to browse
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      id="imageUpload"
                    />
                    <label
                      htmlFor="imageUpload"
                      style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Choose Images
                    </label>
                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
                      Supports JPG, PNG, GIF (max 5MB each)
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      // Save article logic would go here
                      alert('Article publishing feature coming soon! Currently, articles are managed via data/blogPosts.js');
                    }}
                    style={{
                      background: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      flex: 1
                    }}
                  >
                    Publish Article
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Save draft logic would go here
                      alert('Draft saving feature coming soon!');
                    }}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      flex: 1
                    }}
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewArticle(false)}
                    style={{
                      background: 'white',
                      color: '#666',
                      border: '2px solid #e1e5e9',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer style={{
          marginTop: '60px',
          paddingTop: '30px',
          borderTop: '2px solid #f8f9fa',
          textAlign: 'center',
          color: '#666'
        }}>
          <p>CostFlowAI Blog Management • Professional Construction Intelligence</p>
        </footer>
      </div>
    </>
  );
}