import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  MapPin,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Download,
  Phone,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAdminStore from '../../store/adminStore';
import { downloadBill } from '../../utils/downloadBill';

const statusSteps = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
const courierOptions = ['DTDC', 'Delhivery', 'India Post', 'BlueDart', 'Other'];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateOrderStatus, confirmCOD } = useAdminStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Action states
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [codConfirmed, setCodConfirmed] = useState(false);
  const [codNotes, setCodNotes] = useState('');
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      // Use the regular order endpoint — admin has access to any order
      const { data } = await api.get(`/orders/${id}`);
      const payload = data?.data ?? data;
      setOrder(payload.order || payload);
    } catch (error) {
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) { toast.error('Select a status'); return; }
    setActionLoading(true);
    try {
      await updateOrderStatus(id, newStatus, statusNote);
      await fetchOrder();
      setNewStatus('');
      setStatusNote('');
    } catch (e) {
      // handled by store
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCOD = async () => {
    if (!codConfirmed) { toast.error('Please confirm COD checkbox'); return; }
    setActionLoading(true);
    try {
      await confirmCOD(id);
      await fetchOrder();
      setCodConfirmed(false);
      setCodNotes('');
    } catch (e) {
      // handled by store
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveTracking = async () => {
    if (!courier || !trackingNumber) { toast.error('Fill courier and tracking number'); return; }
    setActionLoading(true);
    try {
      // Use updateOrderStatus endpoint which also accepts tracking info
      // If status is not already 'shipped' and tracking is provided, mark as shipped
      const targetStatus = order?.status === 'shipped' || order?.status === 'delivered' ? order.status : 'shipped';
      await api.put(`/admin/orders/${id}/status`, {
        status: targetStatus,
        trackingNumber,
        courierPartner: courier,
        note: `Tracking added: ${courier} - ${trackingNumber}`,
      });
      toast.success('Tracking info saved');
      await fetchOrder();
    } catch (error) {
      toast.error('Failed to save tracking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason) { toast.error('Enter cancellation reason'); return; }
    setActionLoading(true);
    try {
      await updateOrderStatus(id, 'cancelled', cancelReason);
      await fetchOrder();
      setShowCancel(false);
      setCancelReason('');
    } catch (e) {
      // handled by store
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse space-y-3">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Order not found</p>
        <button onClick={() => navigate('/admin/orders')} className="mt-3 text-blue-600 text-sm">
          Back to Orders
        </button>
      </div>
    );
  }

  const currentStepIdx = statusSteps.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-1.5 rounded hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Order #{order.orderNumber}</h2>
            <p className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
            statusColors[order.status] || 'bg-gray-100 text-gray-600'
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Status Timeline */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Order Progress</h3>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, idx) => {
              const isDone = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDone
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      } ${isCurrent ? 'ring-2 ring-blue-300' : ''}`}
                    >
                      {isDone ? (
                        <CheckCircle size={16} />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className={`text-xs mt-1 capitalize ${isDone ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>
                      {step}
                    </span>
                  </div>
                  {idx < statusSteps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 ${
                        idx < currentStepIdx ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customer + Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <User size={16} /> Customer Info
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Name</span>
                <p className="font-medium text-gray-900">{order.user?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-400">Phone</span>
                <p className="font-medium text-gray-900">{order.user?.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-400">Role</span>
                <p className="font-medium capitalize text-gray-900">{order.userType || 'customer'}</p>
              </div>
              <div>
                <span className="text-gray-400">Past Orders</span>
                <p className="font-medium text-gray-900">{order.user?.orderCount || '-'}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Package size={16} /> Items
            </h3>
            <div className="divide-y divide-gray-100">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-3">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                      No img
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name || item.product?.name}</p>
                    <p className="text-xs text-gray-400">
                      Size: {item.size || '-'} | Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">₹{(item.subtotal ?? (item.pricePerPiece ?? 0) * item.quantity).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-400">₹{item.pricePerPiece ?? 0} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin size={16} /> Shipping Address
              </h3>
              <p className="text-sm text-gray-600">
                {order.shippingAddress.name && <span className="font-medium">{order.shippingAddress.name}<br /></span>}
                {order.shippingAddress.street || order.shippingAddress.address}
                {order.shippingAddress.city && <>, {order.shippingAddress.city}</>}
                {order.shippingAddress.state && <>, {order.shippingAddress.state}</>}
                {order.shippingAddress.pincode && <> - {order.shippingAddress.pincode}</>}
                {order.shippingAddress.phone && (
                  <span className="block text-gray-400 mt-1">
                    <Phone size={12} className="inline mr-1" />{order.shippingAddress.phone}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Total Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Total Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{'\u20B9'}{(order.subtotal || order.total || 0).toLocaleString('en-IN')}</span>
              </div>
              {order.shippingCharge !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-900">{'\u20B9'}{(order.shippingCharge || 0).toLocaleString('en-IN')}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">-{'\u20B9'}{(order.discount || 0).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-bold">
                <span className="text-gray-800">Total</span>
                <span className="text-gray-900">{'\u20B9'}{(order.total || 0).toLocaleString('en-IN')}</span>
              </div>
              {order.paymentMethod && (
                <p className="text-xs text-gray-400 mt-1">
                  Payment: {order.paymentMethod.toUpperCase()}
                  {order.paymentStatus && ` (${order.paymentStatus})`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Panel */}
        <div className="space-y-5">
          {/* COD Confirmation */}
          {order.paymentMethod === 'cod' && order.status === 'pending' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">COD Confirmation</h4>
              <label className="flex items-start gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={codConfirmed}
                  onChange={(e) => setCodConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Customer confirmed on call</span>
              </label>
              <textarea
                value={codNotes}
                onChange={(e) => setCodNotes(e.target.value)}
                placeholder="Notes (optional)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-3"
              />
              <button
                onClick={handleConfirmCOD}
                disabled={actionLoading || !codConfirmed}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Confirming...' : 'Confirm COD'}
              </button>
            </div>
          )}

          {/* Update Status */}
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h4>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white mb-3"
              >
                <option value="">Select status</option>
                {statusSteps
                  .filter((s) => statusSteps.indexOf(s) > currentStepIdx)
                  .map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
              </select>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Note (optional)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-3"
              />
              <button
                onClick={handleUpdateStatus}
                disabled={actionLoading || !newStatus}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          )}

          {/* Tracking */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Truck size={16} /> Tracking
            </h4>
            <select
              value={courier || order.courier || ''}
              onChange={(e) => setCourier(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white mb-3"
            >
              <option value="">Select courier</option>
              {courierOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="text"
              value={trackingNumber || order.trackingNumber || ''}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking number"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
            />
            <button
              onClick={handleSaveTracking}
              disabled={actionLoading}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : 'Save Tracking'}
            </button>
          </div>

          {/* Download Bill */}
          <button
            onClick={() => downloadBill(id, order.orderNumber)}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Download Bill
          </button>

          {/* Cancel Order */}
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div>
              {!showCancel ? (
                <button
                  onClick={() => setShowCancel(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  <XCircle size={16} />
                  Cancel Order
                </button>
              ) : (
                <div className="bg-red-50 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-red-700">Cancel this order?</p>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Cancellation reason *"
                    rows={2}
                    className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={actionLoading || !cancelReason}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Cancelling...' : 'Confirm Cancel'}
                    </button>
                    <button
                      onClick={() => { setShowCancel(false); setCancelReason(''); }}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
