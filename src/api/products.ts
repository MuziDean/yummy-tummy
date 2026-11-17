import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Product } from '../types/store';

const mockProducts: Product[] = [
  { id: 1, slug: 'samosa', name: 'Samosa', category_slug: 'crispy-snacks', short_description: 'Spicy potato samosa', description: 'A classic spicy potato samosa', price_usd: 3.50, weight_label: '200g', ingredients: 'Flour, potatoes, spices', variants: ['Regular'], stock_qty: 50, is_available: true, featured: true, info_verified: true, image_url: '/placeholder.svg', created_at: '', updated_at: '' },
  { id: 2, slug: 'nut-butter', name: 'Artisanal Nut Butter', category_slug: 'nut-butters', short_description: 'Freshly ground nut butter', description: 'Rich and creamy artisanal nut butter', price_usd: 8.00, weight_label: '250g', ingredients: 'Nuts, salt', variants: ['Classic'], stock_qty: 30, is_available: true, featured: true, info_verified: true, image_url: '/placeholder.svg', created_at: '', updated_at: '' },
  { id: 3, slug: 'caramelized-nuts', name: 'Caramelized Nuts', category_slug: 'nut-butters', short_description: 'Sweet caramelized nuts', description: 'Crunchy caramelized nuts with a hint of sea salt', price_usd: 6.00, weight_label: '200g', ingredients: 'Nuts, caramel, sea salt', variants: ['Salted', 'Unsalted'], stock_qty: 40, is_available: true, featured: false, info_verified: true, image_url: '/placeholder.svg', created_at: '', updated_at: '' },
  { id: 4, slug: 'granola-bites', name: 'Granola Treats', category_slug: 'nut-butters', short_description: 'Healthy granola bites', description: 'Oat-based granola bites with dried fruits', price_usd: 4.50, weight_label: '150g', ingredients: 'Oats, honey, dried fruits', variants: ['Original', 'Chocolate'], stock_qty: 60, is_available: true, featured: false, info_verified: true, image_url: '/placeholder.svg', created_at: '', updated_at: '' },
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  
  if (slug === 'all' || !slug) {
    res.json(mockProducts);
    return;
  }
  
  const product = mockProducts.find((p: Product) => p.slug === String(slug));
  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }
  
  const related = mockProducts.filter((p: Product) => p.category_slug === product.category_slug && p.id !== product.id && p.is_available).slice(0, 3);
  res.json({ product, related });
}