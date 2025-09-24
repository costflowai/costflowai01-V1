import Link from 'next/link';
import Head from 'next/head';

const calculators = [
  { id: 'concrete', name: 'Concrete Calculator', icon: '🏗️', description: 'Calculate concrete volume and costs' },
  { id: 'asphalt', name: 'Asphalt Calculator', icon: '🛣️', description: 'Estimate asphalt tonnage and costs' },
  { id: 'framing', name: 'Framing Calculator', icon: '🔨', description: 'Calculate lumber and framing materials' },
  { id: 'paint', name: 'Paint Calculator', icon: '🎨', description: 'Determine paint gallons needed' },
  { id: 'drywall', name: 'Drywall Calculator', icon: '📐', description: 'Calculate drywall sheets and materials' },
  { id: 'gravel', name: 'Gravel Calculator', icon: '🪨', description: 'Calculate gravel and aggregate quantities' },
  { id: 'rebar', name: 'Rebar Calculator', icon: '🏗️', description: 'Estimate rebar quantities' },
  { id: 'insulation', name: 'Insulation Calculator', icon: '🏠', description: 'Determine insulation requirements' },
  { id: 'fence', name: 'Fence Calculator', icon: '🚧', description: 'Calculate fence materials' },
  { id: 'flooring', name: 'Flooring Calculator', icon: '🏠', description: 'Estimate flooring materials' },
  { id: 'roofing', name: 'Roofing Calculator', icon: '🏠', description: 'Calculate roofing materials' },
  { id: 'excavation', name: 'Excavation Calculator', icon: '🚜', description: 'Estimate excavation volume' }
];

export default function Calculators() {
  return (
    <>
      <Head>
        <title>Construction Calculators - CostFlowAI</title>
        <meta name="description" content="Professional construction calculators for all your estimation needs" />
      </Head>

      <nav className="nav-header">
        <Link href="/">Home</Link>
        <Link href="/calculators">Calculators</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact</Link>
      </nav>

      <main className="container">
        <h1>Professional Construction Calculators</h1>
        <p>Choose from our suite of calculators for accurate construction estimates</p>

        <div className="calculator-grid">
          {calculators.map(calc => (
            <Link
              key={calc.id}
              href={`/calculators/${calc.id}`}
              className="calculator-card"
            >
              <span className="calculator-icon">{calc.icon}</span>
              <h2>{calc.name}</h2>
              <p>{calc.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}