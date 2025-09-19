// Export functionality (CSV, XLSX, PDF, print)

export function exportToCsv(data, filename = 'export.csv') {
  const csvContent = data.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
}

export function exportToXlsx(data, filename = 'export.xlsx') {
  // Simple XLSX implementation using CSV format for compatibility
  // In a real implementation, you'd use a library like xlsx or exceljs
  const csvContent = data.map(row =>
    row.map(cell => String(cell)).join('\t')
  ).join('\n');

  const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
  downloadFile(blob, filename);
}

export function exportToPdf(data, title = 'Report', filename = 'export.pdf') {
  // Simple PDF export using HTML print functionality
  // In a real implementation, you'd use a library like jsPDF

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