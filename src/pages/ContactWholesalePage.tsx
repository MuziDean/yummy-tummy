import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, MessageCircle, Phone, Store } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { validateWholesaleForm } from '../lib/storeLogic';

export function ContactWholesalePage() {
  const { storefront } = useStore();
  const company = storefront?.company;

  // Wholesale form state
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [wEmail, setWEmail] = useState('');
  const [wPhone, setWPhone] = useState('');
  const [wCity, setWCity] = useState('');
  const [businessType, setBusinessType] = useState('Supermarket / Retail Store');
  const [productInterests, setProductInterests] = useState('');
  const [wMessage, setWMessage] = useState('');
  const [wErrors, setWErrors] = useState<Record<string, string>>({});
  const [wSuccess, setWSuccess] = useState(false);
  const [wSubmitting, setWSubmitting] = useState(false);

  // General contact form state
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cSubject, setCSubject] = useState('Product Enquiry');
  const [cMessage, setCMessage] = useState('');
  const [cError, setCError] = useState<string | null>(null);
  const [cSuccess, setCSuccess] = useState(false);
  const [cSubmitting, setCSubmitting] = useState(false);

  const whatsappDirect = `https://wa.me/${(company?.whatsappNumber || '263770000000').replace(/\D/g, '')}?text=${encodeURIComponent(
    'Hello Yummy Tummy! I would like to enquire about wholesale / retail distribution.',
  )}`;

  const handleWholesaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWSuccess(false);
    const check = validateWholesaleForm({
      companyName,
      contactName,
      email: wEmail,
      phone: wPhone,
      city: wCity,
      productInterests,
    });
    setWErrors(check.errors);
    if (!check.valid) return;

    try {
      setWSubmitting(true);
      await api.submitWholesale({
        companyName,
        contactName,
        email: wEmail,
        phone: wPhone,
        city: wCity,
        businessType,
        productInterests,
        message: wMessage,
      });
      setWSuccess(true);
      setCompanyName('');
      setContactName('');
      setWEmail('');
      setWPhone('');
      setWCity('');
      setProductInterests('');
      setWMessage('');
    } catch (err) {
      setWErrors({ form: err instanceof Error ? err.message : 'Unable to send wholesale enquiry.' });
    } finally {
      setWSubmitting(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCError(null);
    setCSuccess(false);
    try {
      setCSubmitting(true);
      await api.submitContact({
        name: cName,
        email: cEmail,
        phone: cPhone,
        subject: cSubject,
        message: cMessage,
      });
      setCSuccess(true);
      setCName('');
      setCEmail('');
      setCPhone('');
      setCMessage('');
    } catch (err) {
      setCError(err instanceof Error ? err.message : 'Please complete all required fields.');
    } finally {
      setCSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Page Intro */}
      <section className="bg-[#FFF5E9]/65 border-b border-[#EED9C4]/70 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F15A00]">Connect With Us</p>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#35170D] tracking-tight">
            Contact & Wholesale Partnerships
          </h1>
          <p className="text-base text-[#5A524C] max-w-2xl">
            Whether you are a shopper with a question or a supermarket buyer looking to stock Yummy Tummy, we would love
            to hear from you.
          </p>
        </div>
      </section>

      {/* Wholesale & Retail Distribution Section */}
      <section id="wholesale" className="py-16 lg:py-20 border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#F15A00]">
              <Store className="w-4 h-4" aria-hidden="true" />
              <span>Distribution & Wholesale</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#35170D] tracking-tight text-balance">
              LOVE YUMMY TUMMY? LET&apos;S GET IT ON YOUR SHELVES.
            </h2>
            <p className="text-base text-[#5A524C] leading-relaxed">
              Are you a retailer, wholesaler or distribution partner? We&apos;d love to explore how we can bring Yummy
              Tummy products closer to your customers.
            </p>
            <ul className="space-y-2.5 text-sm text-[#35170D]">
              <li>· Supermarkets & national retail chains</li>
              <li>· Independent grocers, convenience stores & tuckshops</li>
              <li>· Regional wholesalers & distribution partners</li>
            </ul>

            <div className="pt-2">
              <a
                href={whatsappDirect}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>WhatsApp Wholesale Enquiry</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#FFF5E9]/45 rounded-3xl border border-[#EED9C4] p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold text-[#35170D] mb-5">Business & Retail Partnership Form</h3>

            {wSuccess && (
              <div
                role="status"
                data-testid="wholesale-success"
                className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Thank you! Your wholesale enquiry has been submitted. Our distribution team will review your company
                  details and get back to you.
                </span>
              </div>
            )}

            {wErrors.form && <p className="mb-4 text-sm text-red-700">{wErrors.form}</p>}

            <form onSubmit={handleWholesaleSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="w-company" className="block text-xs font-semibold text-[#35170D] mb-1">
                  Company / Store Name *
                </label>
                <input
                  id="w-company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Valley Supermarkets"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                />
                {wErrors.companyName && <p className="text-xs text-red-700 mt-1">{wErrors.companyName}</p>}
              </div>

              <div>
                <label htmlFor="w-contact" className="block text-xs font-semibold text-[#35170D] mb-1">
                  Contact Person *
                </label>
                <input
                  id="w-contact"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                />
                {wErrors.contactName && <p className="text-xs text-red-700 mt-1">{wErrors.contactName}</p>}
              </div>

              <div>
                <label htmlFor="w-email" className="block text-xs font-semibold text-[#35170D] mb-1">
                  Business Email *
                </label>
                <input
                  id="w-email"
                  type="email"
                  value={wEmail}
                  onChange={(e) => setWEmail(e.target.value)}
                  placeholder="buyer@company.co.zw"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                />
                {wErrors.email && <p className="text-xs text-red-700 mt-1">{wErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="w-phone" className="block text-xs font-semibold text-[#35170D] mb-1">
                  Phone / WhatsApp *
                </label>
                <input
                  id="w-phone"
                  type="tel"
                  value={wPhone}
                  onChange={(e) => setWPhone(e.target.value)}
                  placeholder="+263 77 ..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                />
                {wErrors.phone && <p className="text-xs text-red-700 mt-1">{wErrors.phone}</p>}
              </div>

              <div>
                <label htmlFor="w-city" className="block text-xs font-semibold text-[#35170D] mb-1">
                  City / Town *
                </label>
                <input
                  id="w-city"
                  type="text"
                  value={wCity}
                  onChange={(e) => setWCity(e.target.value)}
                  placeholder="Harare, Bulawayo, Gweru..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                />
                {wErrors.city && <p className="text-xs text-red-700 mt-1">{wErrors.city}</p>}
              </div>

              <div>
                <label htmlFor="w-type" className="block text-xs font-semibold text-[#35170D] mb-1">
                  Partner Type
                </label>
                <select
                  id="w-type"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                >
                  <option>Supermarket / Retail Store</option>
                  <option>Wholesaler</option>
                  <option>Regional Distributor</option>
                  <option>Corporate / Hospitality</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="w-products" className="block text-xs font-semibold text-[#35170D] mb-1">
                  Products of Interest *
                </label>
                <input
                  id="w-products"
                  type="text"
                  value={productInterests}
                  onChange={(e) => setProductInterests(e.target.value)}
                  placeholder="e.g. Crispy Roll Puffs, Naks range, Almond & Peanut Butters"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                />
                {wErrors.productInterests && <p className="text-xs text-red-700 mt-1">{wErrors.productInterests}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="w-message" className="block text-xs font-semibold text-[#35170D] mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  id="w-message"
                  rows={3}
                  value={wMessage}
                  onChange={(e) => setWMessage(e.target.value)}
                  placeholder="Tell us about your store locations or distribution coverage..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={wSubmitting}
                  className="px-8 py-3.5 rounded-full bg-[#F15A00] hover:bg-[#D64D00] text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-60"
                >
                  {wSubmitting ? 'Sending Enquiry...' : 'Submit Wholesale Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* General Customer Contact */}
      <section className="py-16 lg:py-20 bg-[#F7F6F3]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-5">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#35170D]">General Contact</h2>
            <p className="text-sm text-[#5A524C] leading-relaxed">
              Have a question about an online order, product ingredients, or where to find Yummy Tummy near you? Send us
              a direct note.
            </p>
            <div className="space-y-3 text-sm text-[#35170D]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#F15A00] mt-0.5 shrink-0" aria-hidden="true" />
                <span>{company?.address || 'Harare, Zimbabwe'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#F15A00] shrink-0" aria-hidden="true" />
                <span>{company?.phone || '+263 77 000 0000'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#F15A00] shrink-0" aria-hidden="true" />
                <span>{company?.email || 'hello@yummytummy.co.zw'}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold text-[#35170D] mb-4">Send a Message</h3>
            {cSuccess && (
              <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm">
                Message received. Thank you for reaching out to Yummy Tummy!
              </div>
            )}
            {cError && <p className="mb-4 text-sm text-red-700">{cError}</p>}

            <form onSubmit={handleContactSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="c-name" className="block text-xs font-semibold text-[#35170D] mb-1">
                  Your Name *
                </label>
                <input
                  id="c-name"
                  type="text"
                  required
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                />
              </div>
              <div>
                <label htmlFor="c-email" className="block text-xs font-semibold text-[#35170D] mb-1">
                  Email *
                </label>
                <input
                  id="c-email"
                  type="email"
                  required
                  value={cEmail}
                  onChange={(e) => setCEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                />
              </div>
              <div>
                <label htmlFor="c-phone" className="block text-xs font-semibold text-[#35170D] mb-1">
                  Phone (Optional)
                </label>
                <input
                  id="c-phone"
                  type="tel"
                  value={cPhone}
                  onChange={(e) => setCPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                />
              </div>
              <div>
                <label htmlFor="c-subject" className="block text-xs font-semibold text-[#35170D] mb-1">
                  Subject
                </label>
                <input
                  id="c-subject"
                  type="text"
                  value={cSubject}
                  onChange={(e) => setCSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c-message" className="block text-xs font-semibold text-[#35170D] mb-1">
                  Message *
                </label>
                <textarea
                  id="c-message"
                  rows={4}
                  required
                  value={cMessage}
                  onChange={(e) => setCMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#F15A00]"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={cSubmitting}
                  className="px-7 py-3 rounded-full bg-[#35170D] hover:bg-[#F15A00] text-white text-sm font-bold transition-colors cursor-pointer"
                >
                  {cSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
