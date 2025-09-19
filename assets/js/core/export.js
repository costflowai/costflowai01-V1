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
    // Try to get current nonce from meta tag or existing scripts
    const existingScript = document.querySelector('script[nonce]');
    const nonce = existingScript ? existingScript.getAttribute('nonce') : null;
    
    const script = document.createElement('script');
    script.src = '/vendor/jspdf/jspdf.min.js';
    script.async = true;
    if (nonce) script.nonce = nonce;

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
    // Try to get current nonce from meta tag or existing scripts
    const existingScript = document.querySelector('script[nonce]');
    const nonce = existingScript ? existingScript.getAttribute('nonce') : null;
    
    const script = document.createElement('script');
    script.src = '/vendor/xlsx/xlsx.min.js';
    script.async = true;
    if (nonce) script.nonce = nonce;

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

    // Validate data
    if (!Array.isArray(data) || !data.length || !data[0]?.length) {
      bus.emit(EVENTS.EXPORT_ERROR, { 
        format: 'pdf', 
        error: 'No data available for export. Please calculate results first.' 
      });
      return;
    }

    const { jsPDF } = window.jsPDF;
    const doc = new jsPDF();

    // Generate report ID once for consistency across pages
    const reportId = generateReportId();

    // Professional header
    addProfessionalHeader(doc, title, reportId);
    
    // Table configuration
    const startY = 80;
    const cellPadding = 5;
    const cellHeight = 10;
    const pageWidth = doc.internal.pageSize.width;
    const margins = 20;
    const tableWidth = pageWidth - (margins * 2);

    let currentY = startY;

    // Calculate column widths (safe division)
    const numCols = data[0].length;
    const colWidth = tableWidth / numCols;

    // Add table header styling if first row looks like headers
    let isFirstRow = true;
    
    // Add table data
    data.forEach((row, rowIndex) => {
      // Check if we need a new page
      if (currentY > doc.internal.pageSize.height - 60) {
        doc.addPage();
        addProfessionalHeader(doc, title, reportId);
        currentY = 80;
      }

      let currentX = margins;

      // Set style for header row
      if (isFirstRow) {
        doc.setFillColor(240, 240, 240);
        doc.setFont(undefined, 'bold');
      } else {
        doc.setFillColor(255, 255, 255);
        doc.setFont(undefined, 'normal');
      }

      row.forEach((cell, colIndex) => {
        const cellText = String(cell || '');

        // Draw cell with fill for headers
        doc.rect(currentX, currentY, colWidth, cellHeight, isFirstRow ? 'FD' : 'D');

        // Add text (truncate if too long)
        const maxWidth = colWidth - (cellPadding * 2);
        doc.setFontSize(9);
        const truncatedText = doc.getTextWidth(cellText) > maxWidth
          ? cellText.substring(0, Math.floor(cellText.length * maxWidth / doc.getTextWidth(cellText))) + '...'
          : cellText;

        doc.text(truncatedText, currentX + cellPadding, currentY + cellHeight - 3);
        currentX += colWidth;
      });

      currentY += cellHeight;
      isFirstRow = false;
    });

    // Add professional footer to all pages
    addFootersToAllPages(doc);

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
 * Add professional header to PDF
 */
function addProfessionalHeader(doc, title, reportId) {
  const pageWidth = doc.internal.pageSize.width;
  
  // Company header
  doc.setFillColor(30, 64, 175); // Blue header
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  // Logo/Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('CostFlowAI', 20, 17);
  
  // Professional tagline
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Professional Construction Cost Analysis', pageWidth - 20, 17, { align: 'right' });
  
  // Reset colors
  doc.setTextColor(0, 0, 0);
  
  // Report title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(title, 20, 40);
  
  // Generation info
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const now = new Date();
  doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 20, 50);
  doc.text(`Report ID: ${reportId}`, 20, 58);
  
  // Separator line
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 68, pageWidth - 20, 68);
}

/**
 * Add professional footer with disclaimers to all pages
 */
function addFootersToAllPages(doc) {
  const totalPages = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addProfessionalFooter(doc, i, totalPages);
  }
}

/**
 * Add professional footer with disclaimers to current page
 */
function addProfessionalFooter(doc, pageNum, totalPages) {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const footerY = pageHeight - 40;
  
  // Footer separator line
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
  
  // Disclaimer (only on first page to avoid repetition)
  if (pageNum === 1) {
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    
    const disclaimer = `DISCLAIMER: This report is for estimation purposes only. Actual costs may vary based on market conditions, 
regional factors, and project specifications. CostFlowAI is not responsible for cost overruns or project delays.`;
    
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 40);
    doc.text(disclaimerLines, 20, footerY);
  }
  
  // Footer info (on all pages)
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('www.costflowai.com', pageWidth - 20, pageHeight - 15, { align: 'right' });
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
  
  // Reset colors
  doc.setTextColor(0, 0, 0);
}

/**
 * Generate unique report ID
 */
function generateReportId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `CF-${timestamp}-${randomStr}`.toUpperCase();
}

/**
 * Escape HTML characters to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text || '');
  return div.innerHTML;
}

/**
 * Fallback PDF export using print
 */
function exportToPrintFallback(data, title) {
  // Validate data
  if (!Array.isArray(data) || !data.length) {
    console.error('No data available for print export');
    return;
  }

  const printWindow = window.open('', '_blank');
  const safeTitle = escapeHtml(title);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'unsafe-inline';">
      <title>${safeTitle}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        h1 { color: #333; border-bottom: 2px solid #1e40af; }
        .print-header { margin-bottom: 20px; }
        .print-disclaimer { 
          margin-top: 20px; 
          padding: 10px; 
          border: 1px solid #ccc; 
          font-size: 12px; 
          background-color: #f9f9f9; 
        }
        .no-print { display: none; }
        @media print {
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>${safeTitle}</h1>
        <p><strong>CostFlowAI - Professional Construction Cost Analysis</strong></p>
        <p>Generated: ${escapeHtml(new Date().toLocaleString())}</p>
        <p>Report ID: ${escapeHtml(generateReportId())}</p>
      </div>
      
      <table>
        ${data.map(row => `
          <tr>
            ${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}
          </tr>
        `).join('')}
      </table>
      
      <div class="print-disclaimer">
        <strong>DISCLAIMER:</strong> This report is for estimation purposes only. Actual costs may vary based on market conditions, 
        regional factors, and project specifications. CostFlowAI is not responsible for cost overruns or project delays.
      </div>
      
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