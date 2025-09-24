import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus(result.message || 'Something went wrong');
      }
    } catch (error) {
      setSubmitStatus('Network error. Please try again or email us directly.');
    }

    setIsSubmitting(false);
  };
  return (
    <>
      <Head>
        <title>Contact Us - CostFlowAI</title>
        <meta name="description" content="Get in touch with CostFlowAI for support, questions, or enterprise solutions." />
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
          <h1>Contact CostFlowAI</h1>
          <p>Get in touch for support, questions, or enterprise solutions</p>
        </section>

        <section className="contact-content">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <div className="contact-item">
                <h3>General Contact</h3>
                <p>Email: <a href="mailto:costflowai@gmail.com">costflowai@gmail.com</a></p>
                <p>Response time: Within 24 hours</p>
              </div>

              <div className="contact-item">
                <h3>Business Inquiries</h3>
                <p>Email: <a href="mailto:costflowai@gmail.com">costflowai@gmail.com</a></p>
                <p>For partnerships, enterprise solutions, and custom development</p>
              </div>

              <div className="contact-item">
                <h3>Support & Technical Issues</h3>
                <p>Email: <a href="mailto:costflowai@gmail.com">costflowai@gmail.com</a></p>
                <p>For calculator issues, bug reports, and technical support</p>
              </div>

              <div style={{
                background: '#e3f2fd',
                border: '1px solid #2196F3',
                borderRadius: '8px',
                padding: '20px',
                marginTop: '30px'
              }}>
                <h3 style={{ color: '#1976d2', margin: '0 0 10px 0' }}>About CostFlowAI</h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                  CostFlowAI is revolutionizing construction cost estimation through AI-powered tools and
                  intelligent data analysis. We're building the infrastructure for the next generation
                  of construction intelligence.
                </p>
              </div>
            </div>

            <div className="contact-form">
              <h2>Send us a Message</h2>

              {submitStatus === 'success' && (
                <div style={{
                  background: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '4px',
                  padding: '15px',
                  marginBottom: '20px',
                  color: '#155724'
                }}>
                  <strong>Thank you!</strong> Your message has been sent successfully. We'll get back to you within 24 hours.
                </div>
              )}

              {submitStatus && submitStatus !== 'success' && (
                <div style={{
                  background: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '4px',
                  padding: '15px',
                  marginBottom: '20px',
                  color: '#721c24'
                }}>
                  <strong>Error:</strong> {submitStatus}
                </div>
              )}

              <form className="contact-form-fields" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select a topic</option>
                    <option value="General Support">General Support</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Business Inquiry">Business Inquiry</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                  style={{
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>

                <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                  All messages are sent to <strong>costflowai@gmail.com</strong>
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}