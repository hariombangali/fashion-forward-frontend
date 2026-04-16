import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Calendar,
  IndianRupee,
  Package,
  ArrowRight,
  Building2,
  MapPin,
  FileText,
  Loader2,
  TrendingUp,
  Clock,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useOrderStore from '../../store/orderStore';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

const WholesaleDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { orders, loading, fetchMyOrders } = useOrderStore();
  const [statsLoading, setStatsLoading] = useState(true);

  // Redirect non-wholesalers
  useEffect(() => {
    if (user && user.role !== 'wholesaler') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadData = async () => {
      setStatsLoading(true);
      await fetchMyOrders(1);
      setStatsLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shopName =
    user?.businessDetails?.shopName || user?.name || 'Wholesaler';
  const gst = user?.businessDetails?.gstNumber || 'N/A';
  const city = user?.businessDetails?.city || user?.businessDetails?.address || 'N/A';

  // Compute stats from orders
  const totalOrders = orders?.length || 0;

  const now = new Date();
  const thisMonthOrders = (orders || []).filter((o) => {
    const d = new Date(o.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const totalSpent = (orders || []).reduce(
    (sum, o) => sum + (o.total || o.totalAmount || 0),
    0
  );

  const recentOrders = (orders || []).slice(0, 5);

  const getStatusColor = (status) => {
    const map = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      processing: 'bg-blue-50 text-blue-700 border-blue-200',
      shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return map[status?.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {shopName}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Your wholesale business overview
              </p>
            </div>
            <div className="mt-3 flex items-center gap-3 sm:mt-0">
              <Link
                to="/wholesale/shop"
                className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
              >
                <Package size={16} />
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={ShoppingBag}
            label="Total Orders"
            value={statsLoading ? '-' : totalOrders}
            loading={statsLoading}
          />
          <StatCard
            icon={Calendar}
            label="This Month"
            value={statsLoading ? '-' : thisMonthOrders}
            sublabel="orders"
            loading={statsLoading}
          />
          <StatCard
            icon={IndianRupee}
            label="Total Spent"
            value={statsLoading ? '-' : formatCurrency(totalSpent)}
            loading={statsLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Clock size={18} className="text-gray-400" />
                  Recent Orders
                </h2>
                <Link
                  to="/my-orders"
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  View All
                  <ArrowRight size={14} />
                </Link>
              </div>

              {(loading || statsLoading) && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
              )}

              {!loading && !statsLoading && recentOrders.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <ShoppingBag size={40} className="mx-auto text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">
                    No orders yet. Start by browsing the catalog.
                  </p>
                  <Link
                    to="/wholesale/shop"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Browse Catalog
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              {!loading && !statsLoading && recentOrders.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            #{order.orderNumber || order._id?.slice(-8)}
                          </p>
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {formatDate(order.createdAt)} &middot;{' '}
                          {order.items?.length || 0} item
                          {(order.items?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total || order.totalAmount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Business Profile */}
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 size={18} className="text-gray-400" />
                  Business Profile
                </h2>
              </div>
              <div className="space-y-3 px-5 py-4">
                <ProfileRow
                  icon={Building2}
                  label="Shop Name"
                  value={shopName}
                />
                <ProfileRow
                  icon={FileText}
                  label="GST Number"
                  value={gst}
                />
                <ProfileRow
                  icon={MapPin}
                  label="City"
                  value={city}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={18} className="text-gray-400" />
                  Quick Actions
                </h2>
              </div>
              <div className="p-4 space-y-2">
                <Link
                  to="/wholesale/shop"
                  className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Package size={16} className="text-gray-400" />
                    Browse Catalog
                  </span>
                  <ArrowRight size={14} className="text-gray-400" />
                </Link>
                <Link
                  to="/my-orders"
                  className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag size={16} className="text-gray-400" />
                    View Orders
                  </span>
                  <ArrowRight size={14} className="text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---- Stat Card ---- */
const StatCard = ({ icon: Icon, label, value, sublabel, loading }) => (
  <div className="rounded-lg border border-gray-200 bg-white px-5 py-5">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
        <Icon size={20} className="text-gray-600" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        {loading ? (
          <div className="mt-1 h-6 w-16 animate-pulse rounded bg-gray-200" />
        ) : (
          <p className="text-xl font-bold text-gray-900">
            {value}
            {sublabel && (
              <span className="ml-1 text-sm font-normal text-gray-500">
                {sublabel}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  </div>
);

/* ---- Profile Row ---- */
const ProfileRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <Icon size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

export default WholesaleDashboardPage;
