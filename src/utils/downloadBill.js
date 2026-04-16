import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * Downloads an order bill PDF through the authenticated API
 * (browser links don't include JWT, so we use axios to get a blob)
 */
export async function downloadBill(orderId, orderNumber = '') {
  const toastId = toast.loading('Generating bill...');
  try {
    const response = await api.get(`/orders/${orderId}/bill`, {
      responseType: 'blob',
    });

    // Create a download URL from the blob
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bill-${orderNumber || orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Bill downloaded', { id: toastId });
  } catch (error) {
    console.error('Bill download error:', error);
    toast.error(error.response?.data?.message || 'Failed to download bill', { id: toastId });
  }
}
