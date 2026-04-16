import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  AlertTriangle,
  Bell,
  Plus,
  ArrowRight,
  Eye
} from 'lucide-react';
import useAdminStore from '../../store/adminStore';

function KPICard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bgColor}`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function SalesChart({ dailySales = [] }) {
  const last7 = dailySales.slice(-7);
  const maxRevenue = Math.max(...last7.map((d) => d.revenue || 0), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Sales - Last 7 Days</h3>
      {last7.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No sales data available</p>
      ) : (
        <div className="flex items-end gap-2 h-48">
          {last7.map((day, idx) => {
            const height = Math.max((day.revenue / maxRevenue) * 100, 4);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">
                  {'\u20B9'}{day.revenue >= 1000 ? `${(day.revenue / 1000).toFixed(1)}k` : day.revenue}
                </span>
                <div
                  className="w-full bg-blue-500 rounded-t-md transition-all duration-500 min-w-[20px]"
                  style={{ height: `${height}%` }}
                  title={`${day.orders} orders, \u20B9${day.revenue}`}
                />
                <span className="text-xs text-gray-400 mt-1 truncate w-full text-center">
                  {new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { dashboardStats, allOrders, fetchDashboard, fetchAllOrders, loading } = useAdminStore();

  useEffect(() => {
    fetchDashboard();
    fetchAllOrders({ limit: 10, sort: '-createdAt' });
  }, []);

  const stats = dashboardStats || {};
  const recentOrders = (allOrders || []).slice(0, 10);

  if (loading && !stats.todayOrders && recentOrders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
          <div className="h-48 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={ShoppingBag}
          label="Today's Orders"
          value={stats.todayOrders || 0}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <KPICard
          icon={IndianRupee}
          label="Today's Revenue"
          value={`\u20B9${(stats.todayRevenue || 0).toLocaleString('en-IN')}`}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <KPICard
          icon={Clock}
          label="Pending Orders"
          value={stats.pendingOrders || 0}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <KPICard
          icon={AlertTriangle}
          label="Low Stock Items"
          value={stats.lowStockCount || 0}
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      {/* Pending Applications Banner */}
      {stats.pendingApplications > 0 && (
        <div
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
          onClick={() => navigate('/admin/applications')}
        >
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {stats.pendingApplications} pending wholesaler application{stats.pendingApplications > 1 ? 's' : ''} awaiting review
            </span>
          </div>
          <ArrowRight size={18} className="text-amber-600" />
        </div>
      )}

      {/* Sales Chart */}
      <SalesChart dailySales={stats.dailySales} />

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">Recent Orders</h3>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Order #</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Customer</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Type</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Total</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Date</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id || order.orderNumber} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {order.user?.name || 'N/A'}
                    </td>
                    <td className="px-5 py-3">
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
                    <td className="px-5 py-3 text-right font-medium text-gray-900">
                      {'\u20B9'}{(order.total || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          statusColors[order.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="text-blue-600 hover:text-blue-800"
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
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Product
        </button>
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <ShoppingBag size={16} />
          View All Orders
        </button>
      </div>
    </div>
  );
}
