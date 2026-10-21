/**
 * Clean and normalise an Indian phone number:
 * Strips spaces, dashes, parentheses; prepends 91 if 10-digit number.
 * @param {string} phone 
 * @returns {string} e.g. "919825012345"
 */
export function normalizeIndianPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

/**
 * Share a PDF file via WhatsApp using Web Share API on mobile,
 * or fallback to opening wa.me with automatic download and instructions.
 * 
 * @param {Object} options
 * @param {Blob} options.pdfBlob
 * @param {string} options.filename
 * @param {string} options.customerPhone
 * @param {string} options.customerName
 * @param {string} options.message
 * @param {Function} [options.onFallback]
 */
export async function sharePdfToWhatsApp({
  pdfBlob,
  filename,
  customerPhone,
  customerName,
  message,
  onFallback
}) {
  const file = new File([pdfBlob], filename, { type: 'application/pdf' });
  const normalizedPhone = normalizeIndianPhone(customerPhone);
  const textMsg = message || `Namaste ${customerName || ''}! Please find your billing estimate from Deep Furniture attached.`;

  // 1. Try Mobile Web Share API with File
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: filename,
        text: textMsg,
      });
      return { success: true, method: 'web-share' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, aborted: true };
      }
      console.warn('Web Share failed, falling back to wa.me URL:', err);
    }
  }

  // 2. Fallback: Automatically trigger PDF download
  const blobUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

  // 3. Open WhatsApp link with prefilled text
  const waUrl = normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(textMsg)}`
    : `https://wa.me/?text=${encodeURIComponent(textMsg)}`;

  window.open(waUrl, '_blank');

  if (typeof onFallback === 'function') {
    onFallback();
  }

  return { success: true, method: 'download-and-wa-link' };
}
