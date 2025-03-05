import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generate a PDF from the proposal data
 * @param {Object} proposal - The proposal object
 * @param {string} companyName - The company name to use in the PDF
 * @returns {Promise<Blob>} - Promise that resolves to the PDF blob
 */
export const generateProposalPdf = async (proposal, companyName = 'Tenaga Solar') => {
  // Create a temporary div to render the PDF content
  const pdfContent = document.createElement('div');
  pdfContent.style.width = '790px'; // A4 width in pixels at 96 DPI
  pdfContent.style.position = 'absolute';
  pdfContent.style.left = '-9999px';
  pdfContent.className = 'proposal-pdf-content';
  document.body.appendChild(pdfContent);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Render PDF content with styled HTML
  pdfContent.innerHTML = `
    <style>
      body {
        font-family: Arial, sans-serif;
        color: #333;
        line-height: 1.5;
      }
      .pdf-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 10px;
        border-bottom: 2px solid #3498db;
      }
      .company-name {
        color: #2980b9;
        font-size: 24px;
        margin-bottom: 5px;
      }
      .pdf-title {
        font-size: 28px;
        margin-bottom: 5px;
        color: #2c3e50;
      }
      .proposal-meta {
        margin-bottom: 20px;
        font-size: 14px;
      }
      .meta-item {
        margin-bottom: 5px;
      }
      .meta-item strong {
        display: inline-block;
        width: 120px;
      }
      .section {
        margin-bottom: 25px;
      }
      .section-title {
        font-size: 18px;
        color: #2980b9;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #ddd;
      }
      .system-details {
        display: flex;
        flex-wrap: wrap;
      }
      .system-detail {
        width: 50%;
        margin-bottom: 10px;
      }
      .financial-summary {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      .summary-item {
        text-align: center;
        width: 30%;
        padding: 10px;
        border-radius: 5px;
        background-color: #f8f9fa;
      }
      .summary-item .value {
        font-size: 18px;
        font-weight: bold;
        color: #2980b9;
      }
      .table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      .table th, .table td {
        padding: 8px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      .table th {
        background-color: #f2f2f2;
      }
      .footer {
        margin-top: 50px;
        text-align: center;
        font-size: 12px;
        color: #777;
      }
      .logo {
        width: 130px;
        height: auto;
        margin-bottom: 10px;
      }
      .badge {
        display: inline-block;
        padding: 3px 7px;
        border-radius: 3px;
        font-size: 12px;
        font-weight: bold;
        color: white;
        background-color: #3498db;
      }
      .notes {
        white-space: pre-line;
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
      }
    </style>
    
    <div class="pdf-header">
      <div class="company-name">${companyName}</div>
      <div class="pdf-title">Solar Solution Proposal</div>
    </div>
    
    <div class="proposal-meta">
      <div class="meta-item"><strong>Proposal:</strong> ${proposal.title}</div>
      <div class="meta-item"><strong>Date:</strong> ${formatDate(proposal.createdAt)}</div>
      <div class="meta-item"><strong>Version:</strong> ${proposal.version || 1}</div>
      ${proposal.estimatedInstallDate ? 
        `<div class="meta-item"><strong>Install Date:</strong> ${formatDate(proposal.estimatedInstallDate)}</div>` : ''}
      <div class="meta-item"><strong>Status:</strong> <span class="badge">${proposal.status}</span></div>
    </div>
    
    <div class="section">
      <div class="section-title">Client Information</div>
      <div class="meta-item"><strong>Name:</strong> ${proposal.lead?.name || 'N/A'}</div>
      <div class="meta-item"><strong>Email:</strong> ${proposal.lead?.email || 'N/A'}</div>
      <div class="meta-item"><strong>Phone:</strong> ${proposal.lead?.phone || 'N/A'}</div>
      ${proposal.lead?.address ? `<div class="meta-item"><strong>Address:</strong> ${proposal.lead.address}</div>` : ''}
    </div>
    
    <div class="section">
      <div class="section-title">System Details</div>
      <div class="system-details">
        <div class="system-detail"><strong>Total Capacity:</strong> ${proposal.systemDetails?.totalCapacity ? `${proposal.systemDetails.totalCapacity} kW` : 'N/A'}</div>
        <div class="system-detail"><strong>Panel Type:</strong> ${proposal.systemDetails?.panelType || 'N/A'}</div>
        <div class="system-detail"><strong>Panel Count:</strong> ${proposal.systemDetails?.panelCount || 'N/A'}</div>
        <div class="system-detail"><strong>Inverter Type:</strong> ${proposal.systemDetails?.inverterType || 'N/A'}</div>
        <div class="system-detail"><strong>Est. Production:</strong> ${proposal.systemDetails?.estimatedProduction ? `${proposal.systemDetails.estimatedProduction} kWh/year` : 'N/A'}</div>
        <div class="system-detail"><strong>Battery Storage:</strong> ${proposal.systemDetails?.batteryStorage ? 'Yes' : 'No'}</div>
        ${proposal.systemDetails?.batteryStorage ? 
          `<div class="system-detail"><strong>Battery Capacity:</strong> ${proposal.systemDetails.batteryCapacity ? `${proposal.systemDetails.batteryCapacity} kWh` : 'N/A'}</div>` : ''}
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Financial Details</div>
      
      <div class="financial-summary">
        <div class="summary-item">
          <div>Total Cost</div>
          <div class="value">${proposal.financialDetails?.totalCost ? formatCurrency(proposal.financialDetails.totalCost) : 'N/A'}</div>
        </div>
        <div class="summary-item">
          <div>Net Cost (After Incentives)</div>
          <div class="value">${proposal.financialDetails?.netCost ? formatCurrency(proposal.financialDetails.netCost) : 'N/A'}</div>
        </div>
        <div class="summary-item">
          <div>Payback Period</div>
          <div class="value">${proposal.financialDetails?.paybackPeriod ? `${proposal.financialDetails.paybackPeriod} years` : 'N/A'}</div>
        </div>
      </div>
      
      ${proposal.financialDetails?.incentives && proposal.financialDetails.incentives.length > 0 ? `
        <div class="section-title">Incentives & Rebates</div>
        <table class="table">
          <thead>
            <tr>
              <th>Incentive</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${proposal.financialDetails.incentives.map(incentive => `
              <tr>
                <td>${incentive.name}</td>
                <td>${formatCurrency(incentive.amount)}</td>
              </tr>
            `).join('')}
            <tr>
              <td><strong>Total Incentives</strong></td>
              <td><strong>${formatCurrency(proposal.financialDetails.incentives.reduce((sum, incentive) => sum + (parseFloat(incentive.amount) || 0), 0))}</strong></td>
            </tr>
          </tbody>
        </table>
      ` : ''}
      
      ${proposal.financialDetails?.financingOptions && proposal.financialDetails.financingOptions.length > 0 ? `
        <div class="section-title">Financing Options</div>
        <table class="table">
          <thead>
            <tr>
              <th>Option</th>
              <th>Term</th>
              <th>Monthly Payment</th>
              <th>Interest Rate</th>
              <th>Down Payment</th>
            </tr>
          </thead>
          <tbody>
            ${proposal.financialDetails.financingOptions.map(option => `
              <tr ${proposal.financialDetails.selectedFinancing === option.name ? 'style="background-color: #e8f4fd;"' : ''}>
                <td>${option.name} ${proposal.financialDetails.selectedFinancing === option.name ? '<span class="badge">Recommended</span>' : ''}</td>
                <td>${option.termMonths} months</td>
                <td>${formatCurrency(option.monthlyPayment)}</td>
                <td>${option.interestRate}%</td>
                <td>${formatCurrency(option.downPayment)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}
    </div>
    
    ${proposal.notes ? `
      <div class="section">
        <div class="section-title">Notes</div>
        <div class="notes">${proposal.notes}</div>
      </div>
    ` : ''}
    
    <div class="footer">
      <p>${companyName} | Email: info@tenaga.in | Phone: +91 9544 243 300</p>
      <p>Proposal generated on ${new Date().toLocaleDateString()}</p>
    </div>
  `;

  try {
    // Convert the HTML to canvas
    const canvas = await html2canvas(pdfContent, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false
    });

    // Calculate PDF dimensions (A4 size)
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    
    // We might need multiple pages if content is long
    let heightLeft = imgHeight;
    let position = 0;
    let pageNumber = 1;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297; // A4 height in mm
    
    // Add more pages if needed
    while (heightLeft > 0) {
      position = -297 * pageNumber; // Move up by one page height
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
      pageNumber++;
    }
    
    // Clean up the temporary div
    document.body.removeChild(pdfContent);
    
    // Return the PDF as a blob
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    document.body.removeChild(pdfContent);
    throw error;
  }
};

/**
 * Downloads the proposal as a PDF
 * @param {Object} proposal - The proposal object
 * @param {string} companyName - The company name to use in the PDF
 */
export const downloadProposalPdf = async (proposal, companyName) => {
  try {
    const pdfBlob = await generateProposalPdf(proposal, companyName);
    
    // Create a download link and click it
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Proposal_${proposal.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    alert('Failed to generate PDF. Please try again later.');
  }
};

export default {
  generateProposalPdf,
  downloadProposalPdf
};
