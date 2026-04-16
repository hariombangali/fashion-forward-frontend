import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, ChevronLeft, ChevronRight, CheckSquare, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import useAdminStore from '../../store/adminStore';
import { downloadBill } from '../../utils/downloadBill';

const statusTabs = ['all', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const { allOrders, fetchAllOrders, updateOrderStatus, loading } = useAdminStore();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState({});
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const toggleSelectAll = () => {
    if (selectedOrders.length === allOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(allOrders.map((o) => o._id));
    }
  };

  const toggleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedOrders.length === 0 || bulkProcessing) return;
    setBulkProcessing(true);
    const count = selectedOrders.length;
    const toastId = toast.loading(`Updating ${count} orders...`);
    let success = 0;
    for (const id of selectedOrders) {
      try {
        await updateOrderStatus(id, status);
        success++;
      } catch {
        // skip failed
      }
    }
    toast.dismiss(toastId);
    toast.success(`Done! ${success} of ${count} orders updated`);
    setSelectedOrders([]);
    setBulkProcessing(false);
    loadOrders();
  };

  const handleBulkDownloadBills = async () => {
    if (selectedOrders.length === 0) return;
    const count = selectedOrders.length;
    toast(`Downloading ${count} bill(s)...`, { icon: '📄' });
    for (const id of selectedOrders) {
      await downloadBill(id);
    }
  };

  const loadOrders = async () => {
    const params = { page, limit: 20 };
    if (activeTab !== 'all') params.status = activeTab;
    if (search) params.search = search;
    const data = await fetchAllOrders(params);
    if (data) {
      setTotalPages(data.totalPages || 1);
      if (data.statusCounts) setStatusCounts(data.statusCounts);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadOrders();
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Orders</h2>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-1 bg-white rounded-xl shadow-sm p-1.5">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab}
            {statusCounts[tab] !== undefined && (
              <span className="ml-1.5 text-xs opacity-75">({statusCounts[tab]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 shadow-sm">
          <span className="text-sm font-medium text-blue-800 mr-2">
            {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
          </span>
          <button
            disabled={bulkProcessing}
            onClick={() => handleBulkStatusUpdate('confirmed')}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Mark as Confirmed
          </button>
          <button
            disabled={bulkProcessing}
            onClick={() => handleBulkStatusUpdate('packed')}
            className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            Mark as Packed
          </button>
          <button
            disabled={bulkProcessing}
            onClick={() => handleBulkStatusUpdate('shipped')}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            Mark as Shipped
          </button>
          <button
            disabled={bulkProcessing}
            onClick={() => handleBulkStatusUpdate('cancelled')}
            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Cancel Selected
          </button>
          <button
            disabled={bulkProcessing}
            onClick={handleBulkDownloadBills}
            className="px-3 py-1.5 bg-gray-700 text-white text-xs font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <Download size={13} />
            Download Bills
          </button>
          <button
            onClick={() => setSelectedOrders([])}
            className="ml-auto p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
            title="Clear selection"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allOrders.length > 0 && selectedOrders.length === allOrders.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Order #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Items</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : allOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                allOrders.map((order) => (
                  <tr
                    key={order._id || order.orderNumber}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedOrders.includes(order._id) ? 'bg-blue-50/50' : ''}`}
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  >
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => toggleSelectOrder(order._id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">{order.user?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{order.user?.phone || ''}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          order.userType === 'wholesaler'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {order.userType === 'wholesaler' ? 'W' : 'C'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {order.items?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {'\u20B9'}{(order.total || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          statusColors[order.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
