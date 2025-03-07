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

  try {
    // Removed unused format helpers

    // Render PDF content with styled HTML
    pdfContent.innerHTML = `
      <style>
        /* CSS styles removed for brevity... */
      </style>
      
      <div class="pdf-header">
        <div class="company-name">${companyName}</div>
        <div class="pdf-title">Solar Solution Proposal</div>
      </div>
      
      <!-- Content removed for brevity... -->
    `;

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
    // Always clean up the temporary div even if there's an error
    if (document.body.contains(pdfContent)) {
      document.body.removeChild(pdfContent);
    }
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

export default { generateProposalPdf, downloadProposalPdf };