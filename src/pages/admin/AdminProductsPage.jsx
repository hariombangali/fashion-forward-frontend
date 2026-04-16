import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        allVisibility: 'true',      // admin sees all products (retail + wholesale)
        includeInactive: 'true',    // include soft-deleted
      };
      if (search) params.search = search;
      if (category) params.category = category;
      const { data } = await api.get('/products', { params });
      // Backend returns { success, data: { products, total, page, totalPages } }
      const payload = data?.data ?? data;
      setProducts(Array.isArray(payload?.products) ? payload.products : (Array.isArray(payload) ? payload : []));
      setTotalPages(payload?.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/products/categories');
      const payload = data?.data ?? data;
      setCategoriesList(Array.isArray(payload) ? payload : (payload?.categories || []));
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const getTotalStock = (p) => {
    if (typeof p.totalStock === 'number') return p.totalStock;
    if (p.stock && typeof p.stock === 'object') {
      return Object.values(p.stock).reduce((a, b) => a + (Number(b) || 0), 0);
    }
    return 0;
  };

  const getCategoryName = (cat) => (typeof cat === 'object' ? cat?.name : cat) || '-';

  return (
    <div className="space-y-5 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="text-xs text-gray-500 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or SKU..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </form>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white min-w-[160px]"
        >
          <option value="">All Categories</option>
          {categoriesList.map((c) => (
            <option key={c._id} value={c.slug || c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Image</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">SKU</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Category</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Retail</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Wholesale</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Visibility</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="w-12 h-12 bg-gray-200 rounded-lg" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-3 w-16 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-14 bg-gray-200 rounded ml-auto" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-3 w-14 bg-gray-200 rounded ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-10 bg-gray-200 rounded ml-auto" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No products found</p>
                    <button
                      onClick={() => navigate('/admin/products/new')}
                      className="mt-3 text-indigo-600 text-sm font-medium hover:underline"
                    >
                      + Add your first product
                    </button>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const thumb = p.images?.[0] || p.colors?.[0]?.images?.[0];
                  const lowestWholesale = p.wholesaleTiers?.[0]?.pricePerPiece;
                  const totalStock = getTotalStock(p);
                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                    >
                      <td className="px-4 py-3">
                        {thumb ? (
                          <img src={thumb} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[9px] text-gray-400 font-medium">
                            No img
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden sm:table-cell">{p.sku || '-'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px]">
                        <p className="truncate">{p.name}</p>
                        {p.featured && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">{getCategoryName(p.category)}</td>
                      <td className="px-4 py-3 text-right text-gray-900 font-medium">₹{(p.retailPrice || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right text-gray-500 hidden lg:table-cell text-xs">
                        {lowestWholesale ? `₹${lowestWholesale.toLocaleString('en-IN')}+` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={totalStock === 0 ? 'text-red-600 font-bold' : totalStock <= 5 ? 'text-amber-600 font-semibold' : 'text-gray-900'}>
                          {totalStock}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {p.visibility?.retail && (
                            <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase">
                              Retail
                            </span>
                          )}
                          {p.visibility?.wholesale && (
                            <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded uppercase">
                              Wholesale
                            </span>
                          )}
                          {!p.active && (
                            <span className="text-[9px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded uppercase">
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
