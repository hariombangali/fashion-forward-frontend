import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, XCircle, Loader2, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import useOrderStore from '../../store/orderStore';
import { downloadBill } from '../../utils/downloadBill';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { currentOrder: order, loading, fetchOrderById, cancelOrder } = useOrderStore();

  useEffect(() => {
    fetchOrderById(id);
  }, [id, fetchOrderById]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrder(id);
    } catch {
      // handled by store
    }
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const currentStatusIdx = ORDER_STATUSES.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/my-orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to My Orders
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {order.orderNumber || `Order #${order._id.slice(-8)}`}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
              statusColors[order.status] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {order.status}
          </span>
        </div>

        {/* Status Timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Order Progress</h2>
            <div className="flex items-center justify-between">
              {ORDER_STATUSES.map((status, idx) => {
                const Icon = statusIcons[status];
                const isActive = idx <= currentStatusIdx;
                return (
                  <div key={status} className="flex flex-col items-center flex-1">
                    <div className="relative flex items-center w-full">
                      {idx > 0 && (
                        <div
                          className={`absolute left-0 right-1/2 h-0.5 top-4 -translate-y-1/2 ${
                            idx <= currentStatusIdx ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      )}
                      {idx < ORDER_STATUSES.length - 1 && (
                        <div
                          className={`absolute left-1/2 right-0 h-0.5 top-4 -translate-y-1/2 ${
                            idx < currentStatusIdx ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      )}
                      <div
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                          isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <span
                      className={`text-xs mt-2 capitalize ${
                        isActive ? 'text-green-700 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
          <div className="divide-y">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 py-4">
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={item.product?.images?.[0]?.url || item.product?.images?.[0] || item.image || '/placeholder.png'}
                    alt={item.product?.name || item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{item.product?.name || item.name}</p>
                  <div className="flex gap-2 text-sm text-gray-500">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                    <span>Qty: {item.quantity}</span>
                  </div>
                </div>
                <p className="font-bold text-gray-900">₹{item.subtotal ?? (item.pricePerPiece ?? 0) * item.quantity}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping + Payment + Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h2>
            {order.shippingAddress ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Address information not available.</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Payment Info</h2>
            <p className="text-sm text-gray-600 mb-4">Method: Cash on Delivery (COD)</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{order.subtotal || order.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>{order.shippingCharge === 0 ? 'Free' : `₹${order.shippingCharge || 0}`}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => downloadBill(order._id, order.orderNumber)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            <Download className="w-4 h-4" />
            Download Bill
          </button>
          {canCancel && (
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 border border-red-300 text-red-600 px-5 py-2.5 rounded-lg font-medium hover:bg-red-50 transition"
            >
              <XCircle className="w-4 h-4" />
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
