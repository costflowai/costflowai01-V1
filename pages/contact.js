import Head from 'next/head';
import Link from 'next/link';

export default function Contact() {
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
                <h3>General Support</h3>
                <p>Email: <a href="mailto:support@costflowai.com">support@costflowai.com</a></p>
                <p>Response time: Within 24 hours</p>
              </div>

              <div className="contact-item">
                <h3>Enterprise Sales</h3>
                <p>Email: <a href="mailto:enterprise@costflowai.com">enterprise@costflowai.com</a></p>
                <p>For custom solutions and volume licensing</p>
              </div>

              <div className="contact-item">
                <h3>Technical Issues</h3>
                <p>Email: <a href="mailto:technical@costflowai.com">technical@costflowai.com</a></p>
                <p>For calculator bugs or technical support</p>
              </div>
            </div>

            <div className="contact-form">
              <h2>Send us a Message</h2>
              <form className="contact-form-fields">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input type="text" id="name" name="name" required />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input type="email" id="email" name="email" required />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select id="subject" name="subject" required>
                    <option value="">Select a topic</option>
                    <option value="support">General Support</option>
                    <option value="technical">Technical Issue</option>
                    <option value="enterprise">Enterprise Sales</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea id="message" name="message" rows="5" required></textarea>
                </div>

                <button type="submit" className="btn-primary">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}