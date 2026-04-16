import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, ShoppingBag, ClipboardList } from 'lucide-react';
import useOrderStore from '../../store/orderStore';
import { downloadBill } from '../../utils/downloadBill';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const { currentOrder, fetchOrderById } = useOrderStore();

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-6">Thank you for your purchase. We are processing your order.</p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
          {currentOrder?.orderNumber && (
            <div className="flex justify-between">
              <span className="text-gray-500">Order Number</span>
              <span className="font-medium text-gray-900">{currentOrder.orderNumber}</span>
            </div>
          )}
          {currentOrder?.total && (
            <div className="flex justify-between">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-medium text-gray-900">₹{currentOrder.total}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Payment</span>
            <span className="font-medium text-gray-900">Cash on Delivery</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Est. Delivery</span>
            <span className="font-medium text-gray-900">5-7 business days</span>
          </div>
        </div>

        <button
          onClick={() => downloadBill(orderId, currentOrder?.orderNumber)}
          className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-500 mb-6"
        >
          <Download className="w-4 h-4" />
          Download Bill
        </button>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/shop"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
          <Link
            to="/my-orders"
            className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            <ClipboardList className="w-5 h-5" />
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
