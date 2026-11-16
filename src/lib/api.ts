import type {
  AdminDashboardStats,
  AdminUser,
  Category,
  CompanyInfo,
  ContactMessage,
  CustomerRecord,
  HomepageContent,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentSettings,
  PaymentStatus,
  Product,
  StorefrontPayload,
  WholesaleEnquiry,
} from '../types/store';

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`) as Error & {
      fieldErrors?: Record<string, string>;
      status?: number;
    };
    err.fieldErrors = data.fieldErrors;
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export const api = {
  getStorefront: () => requestJson<StorefrontPayload>('/api/storefront'),
  getProductBySlug: (slug: string) =>
    requestJson<{ product: Product; related: Product[] }>(`/api/products/${encodeURIComponent(slug)}`),

  submitOrder: (payload: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    deliveryAddress: string;
    city: string;
    deliveryInstructions: string;
    deliveryOption: string;
    paymentMethod: PaymentMethod;
    items: Array<{ productId: number; variant: string; quantity: number }>;
  }) =>
    requestJson<{ order: Order; paymentSettings: PaymentSettings }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  submitWholesale: (payload: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    city: string;
    businessType: string;
    productInterests: string;
    message: string;
  }) =>
    requestJson<{ ok: boolean; id: number }>('/api/wholesale', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  submitContact: (payload: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) =>
    requestJson<{ ok: boolean; id: number }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  subscribeNewsletter: (email: string) =>
    requestJson<{ ok: boolean; message: string }>('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  admin: {
    me: () => requestJson<{ user: AdminUser | null }>('/api/admin/me'),
    login: (email: string, password: string) =>
      requestJson<{ user: AdminUser }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    logout: () => requestJson<{ ok: boolean }>('/api/admin/logout', { method: 'POST' }),
    changePassword: (currentPassword: string, newPassword: string) =>
      requestJson<{ ok: boolean }>('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    getDashboard: () => requestJson<AdminDashboardStats>('/api/admin/dashboard'),
    getProducts: () => requestJson<{ products: Product[]; categories: Category[] }>('/api/admin/products'),
    createProduct: (product: Partial<Product>) =>
      requestJson<{ product: Product }>('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(product),
      }),
    updateProduct: (id: number, product: Partial<Product>) =>
      requestJson<{ product: Product }>(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
      }),
    deleteProduct: (id: number) =>
      requestJson<{ ok: boolean }>(`/api/admin/products/${id}`, { method: 'DELETE' }),
    updateCategory: (slug: string, payload: Partial<Category>) =>
      requestJson<{ categories: Category[] }>(`/api/admin/categories/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    uploadImage: (dataUrl: string) =>
      requestJson<{ url: string }>('/api/admin/upload', {
        method: 'POST',
        body: JSON.stringify({ dataUrl }),
      }),
    getOrders: () => requestJson<{ orders: Order[] }>('/api/admin/orders'),
    updateOrder: (id: number, payload: { order_status?: OrderStatus; payment_status?: PaymentStatus }) =>
      requestJson<{ order: Order }>(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    getCustomers: () => requestJson<{ customers: CustomerRecord[] }>('/api/admin/customers'),
    updateCustomer: (id: number, payload: Partial<CustomerRecord>) =>
      requestJson<{ ok: boolean }>(`/api/admin/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    getEnquiries: () =>
      requestJson<{
        wholesale: WholesaleEnquiry[];
        contact: ContactMessage[];
        newsletter: Array<{ id: number; email: string; created_at: string }>;
      }>('/api/admin/enquiries'),
    updateEnquiryStatus: (type: 'wholesale' | 'contact', id: number, status: string) =>
      requestJson<{ ok: boolean }>(`/api/admin/enquiries/${type}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    getSettings: () =>
      requestJson<{ homepage: HomepageContent; company: CompanyInfo; payments: PaymentSettings }>('/api/admin/settings'),
    updateSettings: (payload: {
      homepage?: HomepageContent;
      company?: CompanyInfo;
      payments?: PaymentSettings;
    }) =>
      requestJson<{ homepage: HomepageContent; company: CompanyInfo; payments: PaymentSettings }>(
        '/api/admin/settings',
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        },
      ),
  },
};
