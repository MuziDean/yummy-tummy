import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { CompanyInfo, HomepageContent, PaymentSettings } from '../../types/store';

interface AdminSettingsTabProps {
  initialHomepage: HomepageContent;
  initialCompany: CompanyInfo;
  initialPayments: PaymentSettings;
  onSaved: () => Promise<void>;
}

export function AdminSettingsTab({
  initialHomepage,
  initialCompany,
  initialPayments,
  onSaved,
}: AdminSettingsTabProps) {
  const [homepage, setHomepage] = useState<HomepageContent>(initialHomepage);
  const [company, setCompany] = useState<CompanyInfo>(initialCompany);
  const [payments, setPayments] = useState<PaymentSettings>(initialPayments);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(null);
    setSaving(true);
    try {
      await api.admin.updateSettings({ homepage, company, payments });
      await onSaved();
      setSavedMsg('Website content, contact details, and payment settings saved.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    try {
      await api.admin.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setPwMsg('Administrator password updated.');
    } catch (err) {
      setPwMsg(err instanceof Error ? err.message : 'Unable to update password.');
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-[#35170D]">Website Content & Store Settings</h2>
            <p className="text-xs text-[#5A524C]">
              Update homepage text, Our Story narrative, contact details, social links, and Zimbabwe payment settings.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-[#F15A00] hover:bg-[#D64D00] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>

        {savedMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{savedMsg}</span>
          </div>
        )}

        {/* Homepage & Story Content */}
        <section className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
          <h3 className="font-display text-base font-bold text-[#35170D]">Homepage & Brand Story</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#35170D] mb-1">Hero Introductory Label</label>
              <input
                type="text"
                value={homepage.heroLabel}
                onChange={(e) => setHomepage({ ...homepage, heroLabel: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#35170D] mb-1">Promotional Banner Text</label>
              <input
                type="text"
                value={homepage.promoBannerText}
                onChange={(e) => setHomepage({ ...homepage, promoBannerText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#35170D] mb-1">Hero Supporting Text</label>
              <textarea
                rows={2}
                value={homepage.heroSubtext}
                onChange={(e) => setHomepage({ ...homepage, heroSubtext: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#35170D] mb-1">Founder Introduction (Our Story)</label>
              <textarea
                rows={2}
                value={homepage.storyFounderIntro}
                onChange={(e) => setHomepage({ ...homepage, storyFounderIntro: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Company Contact & Social */}
        <section className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
          <h3 className="font-display text-base font-bold text-[#35170D]">Company Details & Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#35170D] mb-1">Public Phone</label>
              <input
                type="text"
                value={company.phone}
                onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#35170D] mb-1">WhatsApp Order Number</label>
              <input
                type="text"
                value={company.whatsappNumber}
                onChange={(e) => setCompany({ ...company, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#35170D] mb-1">Public Email</label>
              <input
                type="email"
                value={company.email}
                onChange={(e) => setCompany({ ...company, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#35170D] mb-1">Address / City</label>
              <input
                type="text"
                value={company.address}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#35170D] mb-1">Instagram URL</label>
              <input
                type="url"
                value={company.instagramUrl}
                onChange={(e) => setCompany({ ...company, instagramUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#35170D] mb-1">Facebook URL</label>
              <input
                type="url"
                value={company.facebookUrl}
                onChange={(e) => setCompany({ ...company, facebookUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
          <h3 className="font-display text-base font-bold text-[#35170D]">Payment Gateways & Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#35170D] mb-1">EcoCash Merchant Code</label>
              <input
                type="text"
                value={payments.ecocashMerchantCode}
                onChange={(e) => setPayments({ ...payments, ecocashMerchantCode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#35170D] mb-1">Bank Name</label>
              <input
                type="text"
                value={payments.bankName}
                onChange={(e) => setPayments({ ...payments, bankName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#35170D] mb-1">Bank Account Number</label>
              <input
                type="text"
                value={payments.bankAccountNumber}
                onChange={(e) => setPayments({ ...payments, bankAccountNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#35170D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={payments.cardGatewayEnabled}
                  onChange={(e) => setPayments({ ...payments, cardGatewayEnabled: e.target.checked })}
                  className="accent-[#F15A00]"
                />
                <span>Enable Online Card Gateway (only after live merchant keys are connected)</span>
              </label>
            </div>
          </div>
        </section>
      </form>

      {/* Password Security */}
      <form onSubmit={handlePasswordChange} className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
        <h3 className="font-display text-base font-bold text-[#35170D]">Administrator Security</h3>
        {pwMsg && <p className="text-xs text-[#35170D] bg-[#FFF5E9] p-2.5 rounded-lg">{pwMsg}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-[#35170D] mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#35170D] mb-1">New Password (min 8 chars)</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#35170D] hover:bg-[#F15A00] text-white text-xs font-bold cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
