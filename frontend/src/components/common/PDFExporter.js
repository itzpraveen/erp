import React, { useRef } from 'react';
import { Button } from 'react-bootstrap';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Component for exporting content to PDF
 * Lazy loaded only when needed
 */
const PDFExporter = ({
  contentRef,
  filename = 'document.pdf',
  buttonText = 'Export PDF',
  buttonProps = {},
  pdfOptions = {},
  onBeforeExport = null,
  onAfterExport = null,
}) => {
  const defaultButtonProps = {
    variant: 'primary',
    size: 'md',
    className: 'me-2',
    ...buttonProps,
  };

  const defaultPdfOptions = {
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    ...pdfOptions,
  };

  const handleExportPDF = async () => {
    if (!contentRef || !contentRef.current) {
      console.error('Content reference is not available for PDF export');
      return;
    }

    try {
      // Call the before export callback if provided
      if (onBeforeExport) {
        await onBeforeExport();
      }

      const content = contentRef.current;
      const canvas = await html2canvas(content, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow images from other domains
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF(defaultPdfOptions);

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm (210mm)
      const pageHeight = 297; // A4 height in mm (297mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add image to PDF (first page)
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // Top position for new page
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(filename);

      // Call the after export callback if provided
      if (onAfterExport) {
        onAfterExport();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Button {...defaultButtonProps} onClick={handleExportPDF}>
      <i className="fas fa-file-pdf me-2"></i>
      {buttonText}
    </Button>
  );
};

export default PDFExporter;