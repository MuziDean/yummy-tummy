import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../context/StoreContext';
import { YummyTummyLogo } from './YummyTummyLogo';

export function Footer() {
  const { navigate, storefront } = useStore();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const company = storefront?.company;

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!email.trim()) return;
    try {
      setSubmitting(true);
      const res = await api.subscribeNewsletter(email.trim());
      setStatusMsg({ type: 'ok', text: res.message });
      setEmail('');
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to subscribe right now.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#35170D] text-white border-t border-[#4B2315]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <a href="/" onClick={(e) => handleNav(e, '/')} className="inline-block">
              <YummyTummyLogo variant="light" size="lg" logoUrl={company?.logoUrl} />
            </a>
            <p className="text-sm leading-relaxed text-[#F5E7DA]/85 max-w-sm">
              {company?.tagline || 'Bringing delicious flavours and exciting food experiences to Zimbabwe.'}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={company?.instagramUrl || 'https://www.instagram.com/yummy.tummy.official/'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Yummy Tummy on Instagram"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-[#F15A00] text-xs font-medium transition-colors"
              >
                <Instagram className="w-4 h-4" aria-hidden="true" />
                <span>Instagram</span>
              </a>
              <a
                href={company?.facebookUrl || 'https://www.facebook.com/p/Yummy-Tummy-61590373484775/'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Yummy Tummy on Facebook"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-[#F15A00] text-xs font-medium transition-colors"
              >
                <Facebook className="w-4 h-4" aria-hidden="true" />
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display text-sm font-bold tracking-wide text-[#FFB076]">Explore</h3>
            <ul className="space-y-2.5 text-sm text-[#F5E7DA]/85">
              <li>
                <a href="/" onClick={(e) => handleNav(e, '/')} className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/our-story"
                  onClick={(e) => handleNav(e, '/our-story')}
                  className="hover:text-white transition-colors"
                >
                  Our Story
                </a>
              </li>
              <li>
                <a href="/shop" onClick={(e) => handleNav(e, '/shop')} className="hover:text-white transition-colors">
                  Shop
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleNav(e, '/contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/contact#wholesale"
                  onClick={(e) => handleNav(e, '/contact#wholesale')}
                  className="hover:text-white transition-colors"
                >
                  Wholesale Enquiries
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-display text-sm font-bold tracking-wide text-[#FFB076]">Contact</h3>
            <ul className="space-y-3 text-sm text-[#F5E7DA]/85">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F15A00] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{company?.address || 'Harare, Zimbabwe'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#F15A00] shrink-0" aria-hidden="true" />
                <span>{company?.phone || '+263 77 000 0000'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F15A00] shrink-0" aria-hidden="true" />
                <span>{company?.email || 'hello@yummytummy.co.zw'}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-display text-sm font-bold tracking-wide text-[#FFB076]">Stay in the Crunch</h3>
            <p className="text-sm text-[#F5E7DA]/80">
              Be the first to hear about new snack flavours, seasonal packs, and local stockists across Zimbabwe.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address for newsletter
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="footer-newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#F15A00]"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  aria-label="Subscribe to newsletter"
                  className="inline-flex items-center justify-center w-11 h-10 rounded-xl bg-[#F15A00] hover:bg-[#D64D00] text-white shrink-0 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              {statusMsg && (
                <p
                  className={`text-xs flex items-center gap-1.5 ${
                    statusMsg.type === 'ok' ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {statusMsg.type === 'ok' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                  <span>{statusMsg.text}</span>
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Legal & Admin Bar */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F5E7DA]/70">
          <p>© {new Date().getFullYear()} Yummy Tummy Zimbabwe. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <a href="/privacy" onClick={(e) => handleNav(e, '/privacy')} className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" onClick={(e) => handleNav(e, '/terms')} className="hover:text-white transition-colors">
              Terms & Conditions
            </a>
            <a
              href="/shipping"
              onClick={(e) => handleNav(e, '/shipping')}
              className="hover:text-white transition-colors"
            >
              Shipping & Returns
            </a>
            <a href="/admin" onClick={(e) => handleNav(e, '/admin')} className="hover:text-[#FFB076] transition-colors">
              Admin Portal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
