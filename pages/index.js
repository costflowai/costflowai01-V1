import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>CostFlowAI - Professional Construction Cost Estimation</title>
        <meta name="description" content="Professional construction cost calculators with transparent calculations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <nav className="nav-header">
        <Link href="/">Home</Link>
        <Link href="/calculators">Calculators</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact</Link>
      </nav>

      <main>
        <section className="hero">
          <h1>Professional Construction Cost Estimation</h1>
          <p>CostFlowAI delivers accurate, data-driven cost calculations for construction professionals.</p>

          <div className="button-group">
            <Link href="/calculators" className="btn-primary">
              Start Calculating
            </Link>
            <Link href="/blog" className="btn-secondary">
              Read Blog
            </Link>
          </div>
        </section>

        <section className="calculators-preview">
          <h2>Available Calculators</h2>
          <div className="calculator-grid">
            <div className="calculator-card">
              <h3>Concrete Calculator</h3>
              <p>Calculate volume, materials, and costs for slabs, foundations, and pours.</p>
              <Link href="/calculators/concrete" className="btn-calculate">
                Calculate Concrete
              </Link>
            </div>

            <div className="calculator-card">
              <h3>Drywall Calculator</h3>
              <p>Estimate drywall sheets, mud, and labor for interior construction.</p>
              <Link href="/calculators/drywall" className="btn-calculate">
                Calculate Drywall
              </Link>
            </div>

            <div className="calculator-card">
              <h3>Paint Calculator</h3>
              <p>Calculate paint quantities and coverage for interior and exterior projects.</p>
              <Link href="/calculators/paint" className="btn-calculate">
                Calculate Paint
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}