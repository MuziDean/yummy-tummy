import React, { useState } from 'react';
import { Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { api } from '../../lib/api';
import { MEDIA_ASSETS } from '../../lib/mediaAssets';
import { formatUsd } from '../../lib/storeLogic';
import type { Category, Product } from '../../types/store';
import { ProductImage } from '../ProductImage';

interface AdminProductsTabProps {
  products: Product[];
  categories: Category[];
  onChanged: () => Promise<void>;
}

const EMPTY_FORM = {
  id: 0,
  name: '',
  category_slug: 'crispy-snacks',
  short_description: '',
  description: '',
  price_usd: '2.50',
  weight_label: '',
  ingredients: '',
  variantsText: 'Original',
  stock_qty: '25',
  is_available: true,
  featured: true,
  info_verified: false,
  image_url: 'asset://crispy_roll_puffs',
};

export function AdminProductsTab({ products, categories, onChanged }: AdminProductsTabProps) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<typeof EMPTY_FORM | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openNew = () => {
    setError(null);
    setEditing({ ...EMPTY_FORM });
  };

  const openEdit = (p: Product) => {
    setError(null);
    setEditing({
      id: p.id,
      name: p.name,
      category_slug: p.category_slug,
      short_description: p.short_description,
      description: p.description,
      price_usd: p.price_usd.toFixed(2),
      weight_label: p.weight_label,
      ingredients: p.ingredients,
      variantsText: p.variants.join(', '),
      stock_qty: String(p.stock_qty),
      is_available: p.is_available,
      featured: p.featured,
      info_verified: p.info_verified,
      image_url: p.image_url,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setError(null);
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      const res = await api.admin.uploadImage(dataUrl);
      setEditing({ ...editing, image_url: res.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: editing.name,
        category_slug: editing.category_slug,
        short_description: editing.short_description,
        description: editing.description,
        price_usd: parseFloat(editing.price_usd) || 0,
        weight_label: editing.weight_label,
        ingredients: editing.ingredients,
        variants: editing.variantsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        stock_qty: parseInt(editing.stock_qty, 10) || 0,
        is_available: editing.is_available,
        featured: editing.featured,
        info_verified: editing.info_verified,
        image_url: editing.image_url,
      };
      if (editing.id === 0) {
        await api.admin.createProduct(payload);
      } else {
        await api.admin.updateProduct(editing.id, payload);
      }
      setEditing(null);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Delete "${p.name}" from the catalogue?`)) return;
    await api.admin.deleteProduct(p.id);
    await onChanged();
  };

  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.category_slug.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#35170D]">Product Catalogue ({products.length})</h2>
          <p className="text-xs text-[#5A524C]">
            Edit prices, variants, stock quantities, availability, and verified product specifications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter products..."
            aria-label="Filter admin products"
            className="px-3.5 py-2 rounded-lg border border-neutral-300 bg-white text-sm focus:outline-none focus:border-[#F15A00]"
          />
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F15A00] hover:bg-[#D64D00] text-white text-xs font-bold cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Product Modal Form */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Edit Product">
          <div className="fixed inset-0 bg-[#35170D]/40" onClick={() => setEditing(null)} />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-neutral-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-display text-lg font-bold text-[#35170D]">
                {editing.id === 0 ? 'Add New Product' : `Edit ${editing.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close product editor"
                className="p-1.5 rounded-lg hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}

            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#35170D] mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#35170D] mb-1">Category *</label>
                <select
                  value={editing.category_slug}
                  onChange={(e) => setEditing({ ...editing, category_slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#35170D] mb-1">Price (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editing.price_usd}
                  onChange={(e) => setEditing({ ...editing, price_usd: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#35170D] mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editing.stock_qty}
                  onChange={(e) => setEditing({ ...editing, stock_qty: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm tabular-nums"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#35170D] mb-1">
                  Variants / Flavours (comma-separated)
                </label>
                <input
                  type="text"
                  value={editing.variantsText}
                  onChange={(e) => setEditing({ ...editing, variantsText: e.target.value })}
                  placeholder="Smooth, Crunchy"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#35170D] mb-1">Short Description</label>
                <input
                  type="text"
                  value={editing.short_description}
                  onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#35170D] mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#35170D] mb-1">Verified Weight / Size</label>
                <input
                  type="text"
                  value={editing.weight_label}
                  onChange={(e) => setEditing({ ...editing, weight_label: e.target.value })}
                  placeholder="e.g. 250g Jar"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#35170D] mb-1">Verified Ingredients</label>
                <input
                  type="text"
                  value={editing.ingredients}
                  onChange={(e) => setEditing({ ...editing, ingredients: e.target.value })}
                  placeholder="e.g. 100% Roasted Almonds"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
                />
              </div>

              {/* Image Upload or Asset Selection */}
              <div className="sm:col-span-2 space-y-2 border-t border-neutral-200 pt-3">
                <label className="block text-xs font-semibold text-[#35170D]">Product Image</label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-neutral-200 bg-[#FFF5E9] shrink-0">
                    <ProductImage src={editing.image_url} alt={editing.name || 'Preview'} className="w-full h-full object-cover" />
                  </div>
                  <select
                    value={editing.image_url.startsWith('asset://') ? editing.image_url : ''}
                    onChange={(e) => e.target.value && setEditing({ ...editing, image_url: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-neutral-300 text-xs bg-white"
                  >
                    <option value="">Choose studio photo...</option>
                    {Object.keys(MEDIA_ASSETS).map((key) => (
                      <option key={key} value={`asset://${key}`}>
                        {key.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-300 hover:border-[#F15A00] text-xs font-semibold cursor-pointer">
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2 flex flex-wrap gap-6 pt-1 text-xs font-medium text-[#35170D]">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.is_available}
                    onChange={(e) => setEditing({ ...editing, is_available: e.target.checked })}
                    className="accent-[#F15A00]"
                  />
                  <span>Available on Storefront</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.featured}
                    onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                    className="accent-[#F15A00]"
                  />
                  <span>Featured on Homepage</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.info_verified}
                    onChange={(e) => setEditing({ ...editing, info_verified: e.target.checked })}
                    className="accent-[#F15A00]"
                  />
                  <span>Display Verified Weight & Ingredients Publicly</span>
                </label>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#F15A00] hover:bg-[#D64D00] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-[#F7F6F3] text-xs font-semibold text-[#5A524C]">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Price (USD)</th>
              <th className="py-3 px-4 text-right">Stock</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/80">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-[#FFF5E9]/35">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-9 rounded-md overflow-hidden bg-[#FFF5E9] shrink-0 border border-neutral-200/70">
                      <ProductImage src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#35170D]">{p.name}</p>
                      <p className="text-xs text-[#5A524C]">{p.variants.join(' · ') || 'Standard'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-xs text-[#5A524C]">{p.category_slug}</td>
                <td className="py-3 px-4 text-right font-semibold text-[#35170D] tabular-nums">
                  {formatUsd(p.price_usd)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums">
                  <span className={p.stock_qty <= 10 ? 'text-amber-700 font-bold' : 'text-[#35170D]'}>
                    {p.stock_qty}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs font-medium">
                  <span className={p.is_available ? 'text-emerald-700' : 'text-red-700'}>
                    {p.is_available ? 'Available' : 'Hidden'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      aria-label={`Edit ${p.name}`}
                      className="p-2 rounded-lg text-[#35170D] hover:bg-neutral-100 cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      aria-label={`Delete ${p.name}`}
                      className="p-2 rounded-lg text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
