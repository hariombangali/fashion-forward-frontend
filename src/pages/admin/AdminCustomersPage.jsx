import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAdminStore from '../../store/adminStore';
import ToggleSwitch from '../../components/common/ToggleSwitch';

export default function AdminCustomersPage() {
  const navigate = useNavigate();
  const { allCustomers, fetchCustomers, toggleUserStatus, loading } = useAdminStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toggling, setToggling] = useState(null);

  const loadCustomers = async () => {
    const data = await fetchCustomers(page);
    if (data) setTotalPages(data.totalPages || 1);
  };

  useEffect(() => {
    loadCustomers();
  }, [page]);

  const handleToggle = async (id) => {
    const customer = allCustomers.find((c) => c._id === id);
    const isCurrentlyBlocked = customer?.status === 'blocked';
    const action = isCurrentlyBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} ${customer?.name || 'this user'}?`)) return;

    setToggling(id);
    try {
      await toggleUserStatus(id);
      toast.success(isCurrentlyBlocked ? 'User unblocked' : 'User blocked');
      loadCustomers();
    } catch (e) {
      // handled by store
    } finally {
      setToggling(null);
    }
  };

  const filtered = search
    ? allCustomers.filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase()) ||
          c.phone?.includes(search)
      )
    : allCustomers;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Customers</h2>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Orders</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Total Spent</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Joined</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    No customers found
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{customer.name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{customer.email}</td>
                    <td className="px-4 py-3 text-gray-500">{customer.phone || '-'}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{customer.orderCount || 0}</td>
                    <td className="px-4 py-3 text-right text-gray-900 hidden lg:table-cell">
                      {'\u20B9'}{(customer.totalSpent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.status === 'blocked'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          customer.status === 'blocked' ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                        {customer.status === 'blocked' ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => navigate(`/admin/orders?customer=${customer._id}`)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View orders"
                        >
                          <ShoppingBag size={15} />
                        </button>
                        {/* Toggle Switch — Block/Unblock */}
                        <ToggleSwitch
                          isOn={customer.status !== 'blocked'}
                          loading={toggling === customer._id}
                          onToggle={() => handleToggle(customer._id)}
                          labelOn="Active"
                          labelOff="Blocked"
                        />
                      </div>
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
