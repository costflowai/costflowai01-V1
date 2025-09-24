import Head from 'next/head';
import Link from 'next/link';
import { exportData } from '../utils/calculatorUtils';

export default function CalculatorLayout({
  title,
  description,
  children,
  results,
  inputs,
  calculatorType
}) {
  const exportToPDF = () => {
    if (!results) return;

    const printHTML = exportData.toPrintableHTML(title, results);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const exportToCSV = () => {
    if (!results) return;

    const csv = exportData.toCSV(title, inputs, results);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${calculatorType}-estimate.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const shareResults = () => {
    if (!results) return;

    const shareText = `${title} Results:\n${Object.entries(results)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')}\n\nCalculated with CostFlowAI`;

    if (navigator.share) {
      navigator.share({
        title: title,
        text: shareText,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Results copied to clipboard!');
      });
    }
  };

  return (
    <>
      <Head>
        <title>{title} - CostFlowAI</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={`https://costflowai.com/calculators/${calculatorType}`} />

        {/* Enhanced SEO */}
        <meta name="keywords" content={`${calculatorType} calculator, construction calculator, cost estimation, building materials, ${calculatorType} cost`} />
        <meta name="author" content="CostFlowAI" />
        <meta name="language" content="English" />

        {/* Open Graph */}
        <meta property="og:title" content={`${title} - CostFlowAI`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://costflowai.com/calculators/${calculatorType}`} />
        <meta property="og:image" content="https://costflowai.com/icon-512.png" />

        {/* Twitter Card */}
        <meta name="twitter:title" content={`${title} - CostFlowAI`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://costflowai.com/icon-512.png" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": title,
              "description": description,
              "url": `https://costflowai.com/calculators/${calculatorType}`,
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </Head>

      <nav className="nav-header" role="navigation" aria-label="Main navigation">
        <Link href="/" aria-label="Go to homepage">Home</Link>
        <Link href="/calculators" aria-label="Browse construction calculators">Calculators</Link>
        <Link href="/blog" aria-label="Read construction blog posts">Blog</Link>
        <Link href="/contact" aria-label="Contact CostFlowAI">Contact</Link>
      </nav>

      <main className="calculator-container">
        <div className="calculator-header">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        {children}

        {results && (
          <section className="export-section" aria-labelledby="export-heading">
            <h3 id="export-heading">Export Options</h3>
            <div className="export-buttons" role="group" aria-labelledby="export-heading">
              <button
                onClick={exportToPDF}
                className="btn-export"
                aria-label="Export calculation results as PDF for printing"
              >
                📄 Export PDF
              </button>
              <button
                onClick={exportToCSV}
                className="btn-export"
                aria-label="Download calculation results as CSV file"
              >
                📊 Export CSV
              </button>
              <button
                onClick={shareResults}
                className="btn-export"
                aria-label="Share calculation results with others"
              >
                📤 Share Results
              </button>
            </div>
          </section>
        )}

        <div className="calculator-footer">
          <p className="disclaimer">
            * Estimates are based on standard industry calculations. Actual costs may vary based on
            location, material quality, and local market conditions. Always consult with professionals
            for precise project estimation.
          </p>
        </div>
      </main>
    </>
  );
}