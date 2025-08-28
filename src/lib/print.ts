export function printInvoice(invoiceId: string) {
  // Add print-specific class to body with invoice ID
  document.body.classList.add('printing-invoice');
  document.body.setAttribute('data-invoice-id', invoiceId);

  // Trigger print dialog
  window.print();

  // Remove print class after printing
  setTimeout(() => {
    document.body.classList.remove('printing-invoice');
    document.body.removeAttribute('data-invoice-id');
  }, 1000);
}

export function downloadInvoiceAsPDF(invoiceId: string) {
  // For now, we'll use the print function
  // In a real implementation, you might want to use a library like jsPDF
  // or a server-side PDF generation service
  printInvoice(invoiceId);
}
