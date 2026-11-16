export type CategorySlug = 'crispy-snacks';

export interface Category {
  slug: string;
  name: string;
  headline: string;
  description: string;
  sort_order: number;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  category_slug: string;
  short_description: string;
  description: string;
  price_usd: number;
  weight_label: string;
  ingredients: string;
  variants: string[];
  stock_qty: number;
  is_available: boolean;
  featured: boolean;
  info_verified: boolean;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  variant: string;
  priceUsd: number;
  quantity: number;
  imageUrl: string;
  categorySlug: string;
}

export type PaymentMethod = 'ecocash' | 'bank_transfer' | 'card_gateway' | 'whatsapp_assisted';
export type PaymentStatus = 'pending' | 'awaiting_verification' | 'paid' | 'failed';
export type OrderStatus = 'new' | 'confirmed' | 'preparing' | 'dispatched' | 'completed' | 'cancelled';

export interface DeliveryOption {
  id: string;
  label: string;
  description: string;
  feeUsd: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  variant: string;
  unit_price_usd: number;
  quantity: number;
  line_total_usd: number;
}

export interface Order {
  id: number;
  order_ref: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  city: string;
  delivery_instructions: string;
  delivery_option: string;
  delivery_fee_usd: number;
  subtotal_usd: number;
  total_usd: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface CustomerRecord {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  city: string;
  default_address: string;
  notes: string;
  order_count?: number;
  total_spent_usd?: number;
  last_order_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WholesaleEnquiry {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  business_type: string;
  product_interests: string;
  message: string;
  status: string;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export interface HomepageContent {
  heroLabel: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroTitleLine3: string;
  heroSubtext: string;
  promoBannerText: string;
  storyHeadline: string;
  storyFounderIntro: string;
  storyOrigins: string;
  storyManufacturing: string;
  storyPhilosophy: string;
  storyDistribution: string;
  storyVision: string;
  galleryImages: string[];
}

export interface CompanyInfo {
  brandName: string;
  tagline: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  address: string;
  city: string;
  instagramUrl: string;
  facebookUrl: string;
  logoUrl: string;
}

export interface PaymentSettings {
  ecocashEnabled: boolean;
  ecocashMerchantName: string;
  ecocashMerchantCode: string;
  ecocashInstructions: string;
  bankEnabled: boolean;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  bankInstructions: string;
  cardGatewayEnabled: boolean;
  cardProviderName: string;
  cardGatewayNotice: string;
  whatsappOrderEnabled: boolean;
  deliveryOptions: DeliveryOption[];
}

export interface StorefrontPayload {
  categories: Category[];
  products: Product[];
  homepage: HomepageContent;
  company: CompanyInfo;
  payments: PaymentSettings;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'store_manager';
}

export interface AdminDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  revenueUsd: number;
  productCount: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
  wholesaleEnquiriesCount: number;
}
