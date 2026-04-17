import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  AlertTriangle,
  Bell,
  Plus,
  ArrowRight,
  Eye,
  Users,
  Store,
  TrendingUp,
} from 'lucide-react';
import useAdminStore from '../../store/adminStore';
import {
  RevenueAreaChart,
  OrdersBarChart,
  StatusDistributionPie,
  UserTypeDonut,
  TopProductsBar,
  CategorySalesBar,
  MonthlyRevenueLine,
  NewUsersChart,
  PaymentBreakdownPie,
} from '../../components/admin/charts/AnalyticsCharts';

function KPICard({ icon: Icon, label, value, color, bgColor, trend }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bgColor}`}>
        <Icon size={22} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && <p className="text-xs text-gray-400 mt-0.5">{trend}</p>}
      </div>
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

const RANGE_OPTIONS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1Y', days: 365 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    dashboardStats,
    allOrders,
    analytics,
    fetchDashboard,
    fetchAllOrders,
    fetchAnalytics,
    loading,
  } = useAdminStore();
  const [rangeDays, setRangeDays] = useState(30);

  useEffect(() => {
    fetchDashboard();
    fetchAllOrders({ limit: 10, sort: '-createdAt' });
  }, []);

  useEffect(() => {
    fetchAnalytics(rangeDays);
  }, [rangeDays]);

  const stats = dashboardStats || {};
  const recentOrders = (allOrders || []).slice(0, 10);
  const a = analytics || {};
  const summary = a.summary || {};

  const formatINR = (v) =>
    `\u20B9${(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const initialLoading = loading && !stats.todaysOrders && !analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-500">Real-time performance overview</p>
        </div>
        <div className="inline-flex bg-white rounded-lg shadow-sm p-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => setRangeDays(opt.days)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                rangeDays === opt.days
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top KPI row — from dashboard endpoint */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={ShoppingBag}
          label="Today's Orders"
          value={stats.todaysOrders || 0}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <KPICard
          icon={IndianRupee}
          label="Today's Revenue"
          value={formatINR(stats.todaysRevenue)}
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
          value={stats.lowStockProducts || 0}
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      {/* Secondary KPI row — from analytics endpoint */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={TrendingUp}
          label={`Revenue (${rangeDays}d)`}
          value={formatINR(summary.totalRevenue)}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <KPICard
          icon={ShoppingBag}
          label={`Orders (${rangeDays}d)`}
          value={summary.totalOrders || 0}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <KPICard
          icon={IndianRupee}
          label="Avg Order Value"
          value={formatINR(summary.avgOrderValue)}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <KPICard
          icon={Users}
          label="Customers / Wholesalers"
          value={`${stats.totalCustomers || 0} / ${stats.totalWholesalers || 0}`}
          color="text-pink-600"
          bgColor="bg-pink-50"
        />
      </div>

      {/* Pending applications banner */}
      {stats.pendingApplications > 0 && (
        <div
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
          onClick={() => navigate('/admin/applications')}
        >
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {stats.pendingApplications} pending wholesaler application
              {stats.pendingApplications > 1 ? 's' : ''} awaiting review
            </span>
          </div>
          <ArrowRight size={18} className="text-amber-600" />
        </div>
      )}

      {/* Loading skeleton */}
      {initialLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
              <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
              <div className="h-64 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Row 1: Revenue area + Orders bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueAreaChart data={a.dailySales} />
            <OrdersBarChart data={a.dailySales} />
          </div>

          {/* Row 2: Status pie + UserType donut + Payment pie */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatusDistributionPie data={a.statusDistribution} />
            <UserTypeDonut data={a.userTypeSplit} />
            <PaymentBreakdownPie data={a.paymentBreakdown} />
          </div>

          {/* Row 3: Top products + Category sales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopProductsBar data={a.topProducts} />
            <CategorySalesBar data={a.categorySales} />
          </div>

          {/* Row 4: Monthly trend + New users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyRevenueLine data={a.monthlyTrend} />
            <NewUsersChart data={a.newCustomersMonthly} />
          </div>
        </>
      )}

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
        <button
          onClick={() => navigate('/admin/reports')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <TrendingUp size={16} />
          Detailed Reports
        </button>
      </div>
    </div>
  );
}
