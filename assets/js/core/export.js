// Export functionality (CSV, XLSX, PDF, print)
// Enhanced with vendored jsPDF and SheetJS libraries

import { bus, EVENTS } from './bus.js';

// Library loading state
let jsPDFLoaded = false;
let xlsxLoaded = false;

/**
 * Load jsPDF library if not already loaded
 */
async function loadJsPDF() {
  if (jsPDFLoaded || window.jsPDF) {
    return true;
  }

  try {
    const script = document.createElement('script');
    script.src = '/vendor/jspdf/jspdf.min.js';
    script.async = true;
    script.nonce = 'ZXmBngRGKvFl+S0+m0eMxQ==';

    const loadPromise = new Promise((resolve, reject) => {
      script.onload = () => {
        jsPDFLoaded = true;
        resolve(true);
      };
      script.onerror = () => reject(new Error('Failed to load jsPDF'));
    });

    document.head.appendChild(script);
    return await loadPromise;
  } catch (error) {
    console.error('Error loading jsPDF:', error);
    return false;
  }
}

/**
 * Load SheetJS library if not already loaded
 */
async function loadXLSX() {
  if (xlsxLoaded || window.XLSX) {
    return true;
  }

  try {
    const script = document.createElement('script');
    script.src = '/vendor/xlsx/xlsx.min.js';
    script.async = true;
    script.nonce = 'ZXmBngRGKvFl+S0+m0eMxQ==';

    const loadPromise = new Promise((resolve, reject) => {
      script.onload = () => {
        xlsxLoaded = true;
        resolve(true);
      };
      script.onerror = () => reject(new Error('Failed to load XLSX'));
    });

    document.head.appendChild(script);
    return await loadPromise;
  } catch (error) {
    console.error('Error loading XLSX:', error);
    return false;
  }
}

export function exportToCsv(data, filename = 'export.csv') {
  const csvContent = data.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);

  bus.emit(EVENTS.EXPORT_COMPLETED, { format: 'csv', filename });
}

export async function exportToXlsx(data, filename = 'export.xlsx') {
  try {
    const loaded = await loadXLSX();
    if (!loaded || !window.XLSX) {
      throw new Error('XLSX library not available');
    }

    // Convert data array to worksheet
    const worksheet = window.XLSX.utils.aoa_to_sheet(data);

    // Create workbook and add worksheet
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Generate XLSX file and download
    window.XLSX.writeFile(workbook, filename);

    bus.emit(EVENTS.EXPORT_COMPLETED, { format: 'xlsx', filename });

  } catch (error) {
    console.error('XLSX export error:', error);
    bus.emit(EVENTS.EXPORT_ERROR, { format: 'xlsx', error: error.message });

    // Fallback to CSV
    exportToCsv(data, filename.replace('.xlsx', '.csv'));
  }
}

export async function exportToPdf(data, title = 'Report', filename = 'export.pdf') {
  try {
    const loaded = await loadJsPDF();
    if (!loaded || !window.jsPDF) {
      throw new Error('jsPDF library not available');
    }

    const { jsPDF } = window.jsPDF;
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text(title, 20, 20);

    // Add date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);

    // Table configuration
    const startY = 40;
    const cellPadding = 5;
    const cellHeight = 8;
    const pageWidth = doc.internal.pageSize.width;
    const margins = 20;
    const tableWidth = pageWidth - (margins * 2);

    let currentY = startY;

    // Calculate column widths
    const numCols = data[0] ? data[0].length : 0;
    const colWidth = tableWidth / numCols;

    // Add table data
    data.forEach((row, rowIndex) => {
      // Check if we need a new page
      if (currentY > doc.internal.pageSize.height - 30) {
        doc.addPage();
        currentY = 20;
      }

      let currentX = margins;

      row.forEach((cell, colIndex) => {
        const cellText = String(cell);

        // Draw cell border
        doc.rect(currentX, currentY, colWidth, cellHeight);

        // Add text (truncate if too long)
        const maxWidth = colWidth - (cellPadding * 2);
        const truncatedText = doc.getTextWidth(cellText) > maxWidth
          ? cellText.substring(0, Math.floor(cellText.length * maxWidth / doc.getTextWidth(cellText))) + '...'
          : cellText;

        doc.text(truncatedText, currentX + cellPadding, currentY + cellHeight - 2);
        currentX += colWidth;
      });

      currentY += cellHeight;
    });

    // Save the PDF
    doc.save(filename);

    bus.emit(EVENTS.EXPORT_COMPLETED, { format: 'pdf', filename });

  } catch (error) {
    console.error('PDF export error:', error);
    bus.emit(EVENTS.EXPORT_ERROR, { format: 'pdf', error: error.message });

    // Fallback to print
    exportToPrintFallback(data, title);
  }
}

/**
 * Fallback PDF export using print
 */
function exportToPrintFallback(data, title) {
  const printWindow = window.open('', '_blank');
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        h1 { color: #333; border-bottom: 2px solid #007bff; }
        .no-print { display: none; }
        @media print {
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <table>
        ${data.map(row => `
          <tr>
            ${row.map(cell => `<td>${String(cell)}</td>`).join('')}
          </tr>
        `).join('')}
      </table>
      <div class="no-print" style="margin-top: 20px;">
        <button onclick="window.print()">Print PDF</button>
        <button onclick="window.close()">Close</button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export function exportToJson(data, filename = 'export.json') {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  downloadFile(blob, filename);
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function printElement(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for printing');
    return;
  }

  const printWindow = window.open('', '_blank');
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      ${element.innerHTML}
      <script>
        window.onload = function() {
          window.print();
          window.close();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}