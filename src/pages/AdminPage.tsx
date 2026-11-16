import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { formatUsd } from '../lib/storeLogic';
import type {
  AdminDashboardStats,
  AdminUser,
  Category,
  CompanyInfo,
  ContactMessage,
  CustomerRecord,
  HomepageContent,
  Order,
  PaymentSettings,
  Product,
  WholesaleEnquiry,
} from '../types/store';
import { AdminProductsTab } from '../components/admin/AdminProductsTab';
import { AdminOrdersTab } from '../components/admin/AdminOrdersTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';

type AdminTab = 'overview' | 'products' | 'orders' | 'customers' | 'enquiries' | 'settings';

export function AdminPage() {
  const { refreshStorefront } = useStore();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [loginEmail, setLoginEmail] = useState('admin@yummytummy.co.zw');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<AdminTab>('overview');
  const [dashboard, setDashboard] = useState<AdminDashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [enquiries, setEnquiries] = useState<{
    wholesale: WholesaleEnquiry[];
    contact: ContactMessage[];
    newsletter: Array<{ id: number; email: string; created_at: string }>;
  } | null>(null);
  const [settings, setSettings] = useState<{
    homepage: HomepageContent;
    company: CompanyInfo;
    payments: PaymentSettings;
  } | null>(null);

  const loadAllAdminData = useCallback(async () => {
    const [dash, prodRes, ordRes, custRes, enqRes, setRes] = await Promise.all([
      api.admin.getDashboard(),
      api.admin.getProducts(),
      api.admin.getOrders(),
      api.admin.getCustomers(),
      api.admin.getEnquiries(),
      api.admin.getSettings(),
    ]);
    setDashboard(dash);
    setProducts(prodRes.products);
    setCategories(prodRes.categories);
    setOrders(ordRes.orders);
    setCustomers(custRes.customers);
    setEnquiries(enqRes);
    setSettings(setRes);
  }, []);

  useEffect(() => {
    api.admin
      .me()
      .then((res) => {
        setAdminUser(res.user);
        if (res.user) return loadAllAdminData();
      })
      .finally(() => setCheckingAuth(false));
  }, [loadAllAdminData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await api.admin.login(loginEmail, loginPassword);
      setAdminUser(res.user);
      setLoginPassword('');
      await loadAllAdminData();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await api.admin.logout();
    setAdminUser(null);
    setDashboard(null);
  };

  const handleRefreshAll = async () => {
    await Promise.all([loadAllAdminData(), refreshStorefront()]);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F7F6F3]">
        <p className="text-sm text-[#5A524C]">Checking administrator session...</p>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="min-h-[75vh] bg-[#F7F6F3] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F15A00]">
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span>Protected Store Operations</span>
            </div>
            <h1 className="font-display text-2xl font-extrabold text-[#35170D]">Yummy Tummy Admin Sign In</h1>
            <p className="text-xs text-[#5A524C]">
              Sign in to manage products, inventory, orders, customers, and website content.
            </p>
          </div>

          {loginError && (
            <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
              {loginError}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-[#35170D] mb-1">
                Administrator Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-[#35170D] mb-1">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter administrator password"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 rounded-lg bg-[#35170D] hover:bg-[#F15A00] text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-60"
            >
              {loggingIn ? 'Signing In...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="pt-3 border-t border-neutral-200 text-xs text-[#5A524C] space-y-1">
            <p className="font-semibold text-[#35170D]">Initial seeded credentials (change in Settings):</p>
            <p className="font-mono">admin@yummytummy.co.zw / YummyAdmin2026!</p>
          </div>
        </div>
      </div>
    );
  }

  const navButtons: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" aria-hidden="true" /> },
    { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" aria-hidden="true" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" aria-hidden="true" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" aria-hidden="true" /> },
    { id: 'enquiries', label: 'Enquiries', icon: <MessageSquare className="w-4 h-4" aria-hidden="true" /> },
    { id: 'settings', label: 'Content & Payments', icon: <Settings className="w-4 h-4" aria-hidden="true" /> },
  ];

  return (
    <div className="min-h-[82vh] bg-[#F7F6F3] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-neutral-200 p-5 flex flex-col justify-between gap-6 shrink-0">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#F15A00]">Administration</p>
            <p className="font-display text-lg font-extrabold text-[#35170D] mt-0.5">{adminUser.name}</p>
            <p className="text-xs text-[#5A524C]">{adminUser.email}</p>
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0" aria-label="Admin Navigation">
            {navButtons.map((btn) => {
              const active = tab === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setTab(btn.id)}
                  className={`inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active ? 'bg-[#35170D] text-white' : 'text-[#35170D] hover:bg-[#FFF5E9]'
                  }`}
                >
                  {btn.icon}
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-neutral-200 hover:border-red-300 text-xs font-semibold text-[#35170D] hover:text-red-700 transition-colors cursor-pointer self-start lg:w-full"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-5 sm:p-8 max-w-6xl">
        {tab === 'overview' && dashboard && (
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-[#35170D]">Store Operations Overview</h1>
              <p className="text-xs text-[#5A524C]">
                Live metrics aggregated directly from your SQLite products and orders database.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-1">
                <p className="text-xs text-[#5A524C]">Total Orders</p>
                <p className="font-mono text-2xl font-bold text-[#35170D] tabular-nums">{dashboard.totalOrders}</p>
              </div>
              <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-1">
                <p className="text-xs text-[#5A524C]">Pending Orders</p>
                <p className="font-mono text-2xl font-bold text-[#F15A00] tabular-nums">{dashboard.pendingOrders}</p>
              </div>
              <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-1">
                <p className="text-xs text-[#5A524C]">Completed</p>
                <p className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                  {dashboard.completedOrders}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-1">
                <p className="text-xs text-[#5A524C]">Paid Revenue</p>
                <p className="font-mono text-2xl font-bold text-[#35170D] tabular-nums">
                  {formatUsd(dashboard.revenueUsd)}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-1">
                <p className="text-xs text-[#5A524C]">Active Products</p>
                <p className="font-mono text-2xl font-bold text-[#35170D] tabular-nums">{dashboard.productCount}</p>
              </div>
            </div>

            {/* Low-Stock Alerts */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <h2 className="font-display text-base font-bold text-[#35170D]">
                  Low-Stock Notifications ({dashboard.lowStockProducts.length})
                </h2>
              </div>
              {dashboard.lowStockProducts.length === 0 ? (
                <p className="text-xs text-[#5A524C]">All catalogue products currently have more than 10 units in stock.</p>
              ) : (
                <ul className="divide-y divide-neutral-200 text-xs">
                  {dashboard.lowStockProducts.map((p) => (
                    <li key={p.id} className="py-2 flex items-center justify-between">
                      <span className="font-semibold text-[#35170D]">{p.name}</span>
                      <span className="font-mono font-bold text-amber-700 tabular-nums">{p.stock_qty} left</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-[#35170D]">
                  Recent Orders ({dashboard.recentOrders.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setTab('orders')}
                  className="text-xs font-semibold text-[#F15A00] hover:text-[#35170D] cursor-pointer"
                >
                  Manage All Orders
                </button>
              </div>
              {dashboard.recentOrders.length === 0 ? (
                <p className="text-xs text-[#5A524C]">No orders placed yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 text-[#5A524C]">
                        <th className="py-2 pr-4">Order Ref</th>
                        <th className="py-2 pr-4">Customer</th>
                        <th className="py-2 pr-4">Payment</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {dashboard.recentOrders.map((o) => (
                        <tr key={o.id}>
                          <td className="py-2.5 pr-4 font-mono font-semibold text-[#35170D]">{o.order_ref}</td>
                          <td className="py-2.5 pr-4 text-[#35170D]">{o.customer_name}</td>
                          <td className="py-2.5 pr-4 capitalize text-[#5A524C]">{o.payment_status.replace('_', ' ')}</td>
                          <td className="py-2.5 pr-4 capitalize text-[#35170D]">{o.order_status}</td>
                          <td className="py-2.5 text-right font-mono font-bold tabular-nums text-[#35170D]">
                            {formatUsd(o.total_usd)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'products' && (
          <AdminProductsTab products={products} categories={categories} onChanged={handleRefreshAll} />
        )}

        {tab === 'orders' && <AdminOrdersTab orders={orders} onChanged={handleRefreshAll} />}

        {tab === 'customers' && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-[#35170D]">Customers ({customers.length})</h2>
            <div className="bg-white rounded-xl border border-neutral-200 overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 bg-[#F7F6F3] text-xs font-semibold text-[#5A524C]">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4 text-right">Orders</th>
                    <th className="py-3 px-4 text-right">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/80">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 px-4 text-center text-xs text-[#5A524C]">
                        Customer records appear automatically once shoppers place their first order.
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-4 font-semibold text-[#35170D]">{c.full_name}</td>
                        <td className="py-3 px-4 text-xs text-[#5A524C]">
                          {c.email} · {c.phone}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#5A524C]">{c.city}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">{c.order_count || 0}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                          {formatUsd(c.total_spent_usd || 0)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'enquiries' && enquiries && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold text-[#35170D]">
              Wholesale & Contact Enquiries ({enquiries.wholesale.length + enquiries.contact.length})
            </h2>

            <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
              <h3 className="font-display text-base font-bold text-[#35170D]">
                Wholesale & Retail Leads ({enquiries.wholesale.length})
              </h3>
              {enquiries.wholesale.length === 0 ? (
                <p className="text-xs text-[#5A524C]">No wholesale enquiries submitted yet.</p>
              ) : (
                <ul className="divide-y divide-neutral-200 text-xs space-y-2">
                  {enquiries.wholesale.map((w) => (
                    <li key={w.id} className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-[#35170D]">
                          {w.company_name} ({w.business_type}) · {w.city}
                        </p>
                        <p className="text-[#5A524C]">
                          {w.contact_name} · {w.email} · {w.phone}
                        </p>
                        <p className="text-[#35170D] mt-0.5">Interests: {w.product_interests}</p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await api.admin.updateEnquiryStatus('wholesale', w.id, w.status === 'new' ? 'contacted' : 'new');
                          await loadAllAdminData();
                        }}
                        className="px-3 py-1.5 rounded-lg border border-neutral-300 font-semibold cursor-pointer self-start"
                      >
                        Status: {w.status}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
              <h3 className="font-display text-base font-bold text-[#35170D]">
                General Contact Messages ({enquiries.contact.length})
              </h3>
              {enquiries.contact.length === 0 ? (
                <p className="text-xs text-[#5A524C]">No contact messages yet.</p>
              ) : (
                <ul className="divide-y divide-neutral-200 text-xs">
                  {enquiries.contact.map((m) => (
                    <li key={m.id} className="py-2.5 space-y-1">
                      <p className="font-bold text-[#35170D]">
                        {m.subject} — {m.name} ({m.email})
                      </p>
                      <p className="text-[#5A524C]">{m.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === 'settings' && settings && (
          <AdminSettingsTab
            initialHomepage={settings.homepage}
            initialCompany={settings.company}
            initialPayments={settings.payments}
            onSaved={handleRefreshAll}
          />
        )}
      </div>
    </div>
  );
}
