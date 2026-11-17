import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { StorefrontPayload, CompanyInfo, HomepageContent, PaymentSettings, Category, Product } from '../types/store';

const mockCategories: Category[] = [
  { slug: 'crispy-snacks', name: 'Crispy Snacks', headline: 'Crispy Snacks', description: 'Zimbabwean crispy snacks', sort_order: 1 },
];

const mockProducts: Product[] = [
  { id: 1, slug: 'samosa', name: 'Samosa', category_slug: 'crispy-snacks', short_description: 'Spicy potato samosa', description: 'A classic spicy potato samosa', price_usd: 3.50, weight_label: '200g', ingredients: 'Flour, potatoes, spices', variants: ['Regular'], stock_qty: 50, is_available: true, featured: true, info_verified: true, image_url: '/placeholder.svg', created_at: '', updated_at: '' },
  { id: 2, slug: 'nut-butter', name: 'Artisanal Nut Butter', category_slug: 'nut-butters', short_description: 'Freshly ground nut butter', description: 'Rich and creamy artisanal nut butter', price_usd: 8.00, weight_label: '250g', ingredients: 'Nuts, salt', variants: ['Classic'], stock_qty: 30, is_available: true, featured: true, info_verified: true, image_url: '/placeholder.svg', created_at: '', updated_at: '' },
];

const mockCompany: CompanyInfo = {
  brandName: 'Yummy Tummy',
  tagline: 'Good Food. Great Moods. Pure Yummy.',
  phone: '+263 770 000 000',
  email: 'info@yummytummy.com',
  whatsappNumber: '263770000000',
  address: 'Harare, Zimbabwe',
  city: 'Harare',
  instagramUrl: 'https://instagram.com/yummytummy',
  facebookUrl: 'https://facebook.com/yummytummy',
  logoUrl: '/logo 1.png',
};

const mockHomepage: HomepageContent = {
  heroLabel: 'Yummy Tummy',
  heroTitleLine1: 'Discover Our Snacks',
  heroTitleLine2: 'and Treats',
  heroTitleLine3: '',
  heroSubtext: 'Zimbabwean snack and food manufacturing brand founded by Patience Agar',
  promoBannerText: 'Shop online or partner for wholesale',
  storyHeadline: 'Our Story',
  storyFounderIntro: 'Founded by Patience Agar',
  storyOrigins: 'Started in Zimbabwe',
  storyManufacturing: 'Made with care in Zimbabwe',
  storyPhilosophy: 'Pure, wholesome ingredients',
  storyDistribution: 'Across Zimbabwe and beyond',
  storyVision: 'To share Zimbabwean flavors globally',
  galleryImages: ['/placeholder.svg', '/placeholder.svg'],
};

const mockPayments: PaymentSettings = {
  ecocashEnabled: true,
  ecocashMerchantName: 'Yummy Tummy',
  ecocashMerchantCode: '',
  ecocashInstructions: 'Send ECocash to ...',
  bankEnabled: true,
  bankName: 'EcoBank',
  bankAccountName: 'Yummy Tummy',
  bankAccountNumber: '',
  bankBranch: 'Harare',
  bankInstructions: '',
  cardGatewayEnabled: true,
  cardProviderName: 'Stripe',
  cardGatewayNotice: 'Pay with card',
  whatsappOrderEnabled: true,
  deliveryOptions: [
    { id: 'standard', label: 'Standard Delivery', description: '3-5 business days', feeUsd: 5.00 },
    { id: 'express', label: 'Express Delivery', description: '1-2 business days', feeUsd: 10.00 },
    { id: 'pickup', label: 'Click & Collect', description: 'Free pickup from store', feeUsd: 0.00 },
  ],
};

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const storefront: StorefrontPayload = {
    categories: mockCategories,
    products: mockProducts,
    homepage: mockHomepage,
    company: mockCompany,
    payments: mockPayments,
  };
  res.json(storefront);
}