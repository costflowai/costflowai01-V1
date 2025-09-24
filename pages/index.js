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
          <h2>Professional Construction Calculators</h2>
          <div className="calculator-grid">
            {/* Core Construction Materials */}
            <div className="calculator-card">
              <h3>🏗️ Concrete Calculator</h3>
              <p>Calculate volume, materials, and costs for slabs, foundations, and pours.</p>
              <Link href="/calculators/concrete" className="btn-calculate">
                Calculate Concrete
              </Link>
            </div>

            <div className="calculator-card">
              <h3>🛣️ Asphalt Calculator</h3>
              <p>Estimate asphalt tonnage and costs for paving projects.</p>
              <Link href="/calculators/asphalt" className="btn-calculate">
                Calculate Asphalt
              </Link>
            </div>

            <div className="calculator-card">
              <h3>🏠 Flooring Calculator</h3>
              <p>Calculate materials and costs for laminate, hardwood, tile, and carpet installations.</p>
              <Link href="/calculators/flooring" className="btn-calculate">
                Calculate Flooring
              </Link>
            </div>

            <div className="calculator-card">
              <h3>⚒️ Rebar Calculator</h3>
              <p>Calculate reinforcement requirements for concrete structures and slabs.</p>
              <Link href="/calculators/rebar" className="btn-calculate">
                Calculate Rebar
              </Link>
            </div>

            {/* Structural & Framing */}
            <div className="calculator-card">
              <h3>🔨 Framing Calculator</h3>
              <p>Estimate lumber, studs, and plates for wall framing projects.</p>
              <Link href="/calculators/framing" className="btn-calculate">
                Calculate Framing
              </Link>
            </div>

            <div className="calculator-card">
              <h3>🏗️ Excavation Calculator</h3>
              <p>Calculate digging, hauling, and disposal costs for site preparation.</p>
              <Link href="/calculators/excavation" className="btn-calculate">
                Calculate Excavation
              </Link>
            </div>

            <div className="calculator-card">
              <h3>🚧 Fence Calculator</h3>
              <p>Estimate materials and costs for wood, vinyl, and metal fencing.</p>
              <Link href="/calculators/fence" className="btn-calculate">
                Calculate Fencing
              </Link>
            </div>

            <div className="calculator-card">
              <h3>🪨 Gravel Calculator</h3>
              <p>Calculate tonnage and costs for driveways, walkways, and landscaping.</p>
              <Link href="/calculators/gravel" className="btn-calculate">
                Calculate Gravel
              </Link>
            </div>

            {/* Interior & Exterior */}
            <div className="calculator-card">
              <h3>📐 Drywall Calculator</h3>
              <p>Estimate drywall sheets, mud, and labor for interior construction.</p>
              <Link href="/calculators/drywall" className="btn-calculate">
                Calculate Drywall
              </Link>
            </div>

            <div className="calculator-card">
              <h3>🎨 Paint Calculator</h3>
              <p>Calculate paint quantities and coverage for interior and exterior projects.</p>
              <Link href="/calculators/paint" className="btn-calculate">
                Calculate Paint
              </Link>
            </div>

            <div className="calculator-card">
              <h3>🏠 Insulation Calculator</h3>
              <p>Calculate R-value requirements and costs for energy-efficient construction.</p>
              <Link href="/calculators/insulation" className="btn-calculate">
                Calculate Insulation
              </Link>
            </div>

            <div className="calculator-card">
              <h3>🏘️ Roofing Calculator</h3>
              <p>Estimate shingles, materials, and costs for all roofing projects.</p>
              <Link href="/calculators/roofing" className="btn-calculate">
                Calculate Roofing
              </Link>
            </div>
          </div>

          <div className="container" style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/calculators" className="btn-primary">
              View All Calculators →
            </Link>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <h2>Why Choose CostFlowAI?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>⚡ Instant Results</h3>
                <p>Get accurate calculations in seconds with our optimized algorithms.</p>
              </div>
              <div className="feature-card">
                <h3>📊 Detailed Breakdown</h3>
                <p>Comprehensive cost analysis with material and labor breakdowns.</p>
              </div>
              <div className="feature-card">
                <h3>📄 Export Ready</h3>
                <p>Export calculations to PDF, CSV, or print directly from your browser.</p>
              </div>
              <div className="feature-card">
                <h3>🎯 Professional Accuracy</h3>
                <p>Industry-standard formulas used by construction professionals.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}