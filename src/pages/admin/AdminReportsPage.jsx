import React, { useEffect, useState } from 'react';
import {
  Calendar,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Download,
  AlertTriangle,
  Edit3
} from 'lucide-react';
import toast from 'react-hot-toast';
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

function getDefaultDates() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

export default function AdminReportsPage() {
  const {
    salesReport,
    lowStockProducts,
    analytics,
    fetchSalesReport,
    fetchLowStock,
    fetchAnalytics,
    loading,
  } = useAdminStore();
  const [dateRange, setDateRange] = useState(getDefaultDates);
  const [reportLoading, setReportLoading] = useState(false);
  const [analyticsDays, setAnalyticsDays] = useState(30);

  useEffect(() => {
    loadReport();
    fetchLowStock();
    fetchAnalytics(analyticsDays);
  }, []);

  useEffect(() => {
    fetchAnalytics(analyticsDays);
  }, [analyticsDays]);

  const loadReport = async () => {
    setReportLoading(true);
    await fetchSalesReport(dateRange.from, dateRange.to);
    setReportLoading(false);
  };

  const handleDateChange = (key, value) => {
    setDateRange((prev) => ({ ...prev, [key]: value }));
  };

  const report = Array.isArray(salesReport) ? salesReport : [];

  const exportToCSV = () => {
    if (report.length === 0) {
      toast.error('No data to export');
      return;
    }
    const header = 'Date,Orders,Revenue';
    const rows = report.map((day) => {
      const date = new Date(day.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      return `"${date}",${day.orders || 0},${day.revenue || 0}`;
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-report-${dateRange.from}-to-${dateRange.to}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const totalRevenue = report.reduce((acc, d) => acc + (d.revenue || 0), 0);
  const totalOrders = report.reduce((acc, d) => acc + (d.orders || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const a = analytics || {};

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>

      {/* Analytics window selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-base font-semibold text-gray-700">Visual Analytics</h3>
        <div className="inline-flex bg-white rounded-lg shadow-sm p-1">
          {[7, 30, 90, 365].map((d) => (
            <button
              key={d}
              onClick={() => setAnalyticsDays(d)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                analyticsDays === d
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {d === 365 ? '1Y' : `${d}D`}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueAreaChart data={a.dailySales} />
        <OrdersBarChart data={a.dailySales} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatusDistributionPie data={a.statusDistribution} />
        <UserTypeDonut data={a.userTypeSplit} />
        <PaymentBreakdownPie data={a.paymentBreakdown} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsBar data={a.topProducts} />
        <CategorySalesBar data={a.categorySales} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyRevenueLine data={a.monthlyTrend} />
        <NewUsersChart data={a.newCustomersMonthly} />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Sales Report (Date Range)</h3>
      </div>

      {/* Date Range */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => handleDateChange('from', e.target.value)}
                className="pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => handleDateChange('to', e.target.value)}
                className="pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <button
            onClick={loadReport}
            disabled={reportLoading}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {reportLoading ? 'Loading...' : 'Generate Report'}
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center">
            <IndianRupee size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-xl font-bold text-gray-900">
              {'\u20B9'}{totalRevenue.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
            <ShoppingBag size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-purple-50 flex items-center justify-center">
            <TrendingUp size={20} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Order Value</p>
            <p className="text-xl font-bold text-gray-900">
              {'\u20B9'}{avgOrderValue.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Sales Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">Daily Sales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Date</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Orders</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Revenue</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Items Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportLoading || loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-12 bg-gray-200 rounded ml-auto" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-16 bg-gray-200 rounded ml-auto" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-10 bg-gray-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : report.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">
                    No sales data for this period
                  </td>
                </tr>
              ) : (
                report.map((day, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-900">
                      {new Date(day.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-900">{day.orders || 0}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">
                      {'\u20B9'}{(day.revenue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-500">{day.itemsSold || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Products */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" />
          <h3 className="text-base font-semibold text-gray-800">Low Stock Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Product</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">SKU</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Current Stock</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-3"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-10 bg-gray-200 rounded ml-auto" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-20 bg-gray-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : (lowStockProducts || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">
                    No low stock products
                  </td>
                </tr>
              ) : (
                (lowStockProducts || []).map((product) => {
                  const stock =
                    typeof product.stock === 'number'
                      ? product.stock
                      : Object.values(product.sizeStock || {}).reduce((a, b) => a + b, 0);
                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900 max-w-[250px] truncate">
                        {product.name}
                      </td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{product.sku || '-'}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-red-600 font-semibold">{stock}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() =>
                            (window.location.href = `/admin/products/edit/${product._id}`)
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Edit3 size={13} />
                          Update Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
