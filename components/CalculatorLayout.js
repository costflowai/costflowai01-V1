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
      </Head>

      <nav className="nav-header">
        <Link href="/">Home</Link>
        <Link href="/calculators">Calculators</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact</Link>
      </nav>

      <main className="calculator-container">
        <div className="calculator-header">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        {children}

        {results && (
          <div className="export-section">
            <h3>Export Options</h3>
            <div className="export-buttons">
              <button onClick={exportToPDF} className="btn-export">
                📄 Export PDF
              </button>
              <button onClick={exportToCSV} className="btn-export">
                📊 Export CSV
              </button>
              <button onClick={shareResults} className="btn-export">
                📤 Share Results
              </button>
            </div>
          </div>
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