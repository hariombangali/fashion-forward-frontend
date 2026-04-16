import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'Free Size'];
const fabricOptions = ['Cotton', 'Silk', 'Georgette', 'Chiffon', 'Crepe', 'Rayon', 'Polyester', 'Linen', 'Net', 'Velvet', 'Satin', 'Other'];

const emptyTier = { minQty: '', maxQty: '', pricePerPiece: '' };
const emptyColor = { name: '', hex: '#000000', images: [] };

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categoryList, setCategoryList] = useState([]);

  // Fetch categories from backend
  useEffect(() => {
    api.get('/products/categories')
      .then(({ data }) => {
        const payload = data?.data ?? data;
        const list = Array.isArray(payload) ? payload : (payload?.categories || []);
        setCategoryList(list);
      })
      .catch(() => {});
  }, []);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    subcategory: '',
    sizes: [],
    colors: [{ ...emptyColor }],
    fabric: '',
    retailMRP: '',
    retailPrice: '',
    wholesaleTiers: [{ ...emptyTier }],
    wholesaleMOQ: '',
    sizeStock: {},
    showRetail: true,
    showWholesale: true,
    featured: false,
    tags: '',
    weight: '',
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      // Admin-specific route that bypasses visibility filter
      api.get(`/products/admin/${id}`)
        .then(({ data }) => {
          // Backend returns { success, data: product } — unwrap
          const payload = data?.data ?? data;
          const p = payload.product || payload;

          // Normalize stock (Mongoose Map is serialized as plain object)
          let stockObj = {};
          if (p.stock && typeof p.stock === 'object') {
            stockObj = p.stock;
          } else if (p.sizeStock && typeof p.sizeStock === 'object') {
            stockObj = p.sizeStock;
          }

          // Normalize category — could be object or ID
          const categoryId = typeof p.category === 'object' ? p.category?._id : p.category;

          setForm({
            name: p.name || '',
            sku: p.sku || '',
            description: p.description || '',
            category: categoryId || '',
            subcategory: p.subCategory || p.subcategory || '',
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
            colors: p.colors?.length
              ? p.colors.map((c) => ({
                  name: c.name || '',
                  hex: c.hex || '#000000',
                  images: c.images || [],
                }))
              : [{ ...emptyColor }],
            fabric: p.fabric || '',
            retailMRP: p.retailMRP ?? p.mrp ?? '',
            retailPrice: p.retailPrice ?? p.price ?? '',
            wholesaleTiers: p.wholesaleTiers?.length ? p.wholesaleTiers : [{ ...emptyTier }],
            wholesaleMOQ: p.wholesaleMOQ ?? p.moq ?? '',
            sizeStock: stockObj,
            showRetail: p.visibility?.retail ?? p.showRetail ?? true,
            showWholesale: p.visibility?.wholesale ?? p.showWholesale ?? false,
            featured: p.featured || false,
            tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || '',
            weight: p.weightGrams ?? p.weight ?? '',
          });
          setExistingImages(Array.isArray(p.images) ? p.images : []);
        })
        .catch((err) => {
          console.error(err);
          toast.error(err.response?.data?.message || 'Failed to load product');
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSize = (size) => {
    setForm((prev) => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      const sizeStock = { ...prev.sizeStock };
      if (!sizes.includes(size)) delete sizeStock[size];
      else if (!(size in sizeStock)) sizeStock[size] = 0;
      return { ...prev, sizes, sizeStock };
    });
  };

  const updateSizeStock = (size, val) => {
    setForm((prev) => ({
      ...prev,
      sizeStock: { ...prev.sizeStock, [size]: parseInt(val) || 0 },
    }));
  };

  // Colors
  const updateColor = (idx, key, val) => {
    setForm((prev) => {
      const colors = [...prev.colors];
      colors[idx] = { ...colors[idx], [key]: val };
      return { ...prev, colors };
    });
  };
  const addColor = () => setForm((prev) => ({ ...prev, colors: [...prev.colors, { ...emptyColor }] }));
  const removeColor = (idx) => {
    if (form.colors.length <= 1) return;
    setForm((prev) => ({ ...prev, colors: prev.colors.filter((_, i) => i !== idx) }));
  };

  // Wholesale Tiers
  const updateTier = (idx, key, val) => {
    setForm((prev) => {
      const tiers = [...prev.wholesaleTiers];
      tiers[idx] = { ...tiers[idx], [key]: val };
      return { ...prev, wholesaleTiers: tiers };
    });
  };
  const addTier = () => setForm((prev) => ({ ...prev, wholesaleTiers: [...prev.wholesaleTiers, { ...emptyTier }] }));
  const removeTier = (idx) => {
    if (form.wholesaleTiers.length <= 1) return;
    setForm((prev) => ({ ...prev, wholesaleTiers: prev.wholesaleTiers.filter((_, i) => i !== idx) }));
  };

  // Images
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const removeExistingImage = (idx) => setExistingImages((prev) => prev.filter((_, i) => i !== idx));

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category) {
      toast.error('Name and Category are required');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('sku', form.sku);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('subcategory', form.subcategory);
      formData.append('sizes', JSON.stringify(form.sizes));
      formData.append('colors', JSON.stringify(form.colors));
      formData.append('fabric', form.fabric);
      formData.append('retailMRP', form.retailMRP);
      formData.append('retailPrice', form.retailPrice);
      formData.append('wholesaleTiers', JSON.stringify(form.wholesaleTiers.filter(t => t.minQty && t.pricePerPiece)));
      formData.append('wholesaleMOQ', form.wholesaleMOQ);
      formData.append('sizeStock', JSON.stringify(form.sizeStock));
      // Visibility as an object that backend will parse
      formData.append('visibility', JSON.stringify({
        retail: !!form.showRetail,
        wholesale: !!form.showWholesale,
      }));
      formData.append('featured', String(!!form.featured));
      // Tags as array (backend filters empty)
      const tagsArray = typeof form.tags === 'string'
        ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
        : Array.isArray(form.tags) ? form.tags : [];
      formData.append('tags', JSON.stringify(tagsArray));
      // Backend uses weightGrams field name
      if (form.weight) formData.append('weightGrams', form.weight);
      formData.append('existingImages', JSON.stringify(existingImages));

      images.forEach((file) => formData.append('images', file));

      if (isEdit) {
        await api.put(`/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse space-y-3">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-100 rounded" />
            <div className="h-10 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/admin/products')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} />
        Back to Products
      </button>

      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => updateForm('sku', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => updateForm('category', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                required
              >
                <option value="">Select category</option>
                {categoryList.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {categoryList.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">Loading categories...</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <input
                type="text"
                value={form.subcategory}
                onChange={(e) => updateForm('subcategory', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Images</h3>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
          >
            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {(existingImages.length > 0 || images.length > 0) && (
            <div className="flex flex-wrap gap-3">
              {existingImages.map((url, idx) => (
                <div key={`ex-${idx}`} className="relative group">
                  <img src={url} alt="" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {images.map((file, idx) => (
                <div key={`new-${idx}`} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover border border-blue-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Variants */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Variants</h3>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.sizes.includes(size)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
            <div className="space-y-3">
              {form.colors.map((color, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => updateColor(idx, 'hex', e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color.name}
                    onChange={(e) => updateColor(idx, 'name', e.target.value)}
                    placeholder="Color name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {form.colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColor(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addColor}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <Plus size={14} /> Add Color
              </button>
            </div>
          </div>

          {/* Fabric */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fabric</label>
            <select
              value={form.fabric}
              onChange={(e) => updateForm('fabric', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white md:w-1/2"
            >
              <option value="">Select fabric</option>
              {fabricOptions.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retail MRP ({'\u20B9'})</label>
              <input
                type="number"
                value={form.retailMRP}
                onChange={(e) => updateForm('retailMRP', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retail Selling Price ({'\u20B9'})</label>
              <input
                type="number"
                value={form.retailPrice}
                onChange={(e) => updateForm('retailPrice', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Wholesale Tiers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wholesale Tiers</label>
            <div className="space-y-3">
              {form.wholesaleTiers.map((tier, idx) => (
                <div key={idx} className="flex items-center gap-2 flex-wrap">
                  <input
                    type="number"
                    value={tier.minQty}
                    onChange={(e) => updateTier(idx, 'minQty', e.target.value)}
                    placeholder="Min Qty"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="number"
                    value={tier.maxQty}
                    onChange={(e) => updateTier(idx, 'maxQty', e.target.value)}
                    placeholder="Max Qty"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-gray-400 text-sm">=</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{'\u20B9'}</span>
                    <input
                      type="number"
                      value={tier.pricePerPiece}
                      onChange={(e) => updateTier(idx, 'pricePerPiece', e.target.value)}
                      placeholder="Price/pc"
                      className="w-28 pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  {form.wholesaleTiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTier(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTier}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <Plus size={14} /> Add Tier
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wholesale MOQ</label>
            <input
              type="number"
              value={form.wholesaleMOQ}
              onChange={(e) => updateForm('wholesaleMOQ', e.target.value)}
              className="w-full md:w-1/3 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </section>

        {/* Stock */}
        {form.sizes.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Size-wise Stock</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {form.sizes.map((size) => (
                <div key={size}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{size}</label>
                  <input
                    type="number"
                    value={form.sizeStock[size] || ''}
                    onChange={(e) => updateSizeStock(size, e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Visibility & Meta */}
        <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Visibility & Meta</h3>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showRetail}
                onChange={(e) => updateForm('showRetail', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show in Retail Store</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showWholesale}
                onChange={(e) => updateForm('showWholesale', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show in Wholesale Store</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => updateForm('featured', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Featured Product</span>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => updateForm('tags', e.target.value)}
                placeholder="e.g., new arrival, bestseller"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (grams)</label>
              <input
                type="number"
                value={form.weight}
                onChange={(e) => updateForm('weight', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center gap-3 pb-6">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
