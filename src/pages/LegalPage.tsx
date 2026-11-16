import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'shipping';
}

export function LegalPage({ type }: LegalPageProps) {
  const { navigate, storefront } = useStore();
  const email = storefront?.company.email || 'hello@yummytummy.co.zw';

  const content =
    type === 'privacy'
      ? {
          title: 'Privacy Policy',
          paragraphs: [
            'Yummy Tummy collects customer contact and delivery details solely to fulfil snack and food orders, respond to wholesale and customer enquiries, and send updates when you subscribe to our newsletter.',
            'We do not sell or share personal customer information with third-party marketers. Order records are stored securely and accessed only by authorised Yummy Tummy administrators.',
            `To update or request removal of your customer record, please contact us at ${email}.`,
          ],
        }
      : type === 'terms'
        ? {
            title: 'Terms & Conditions',
            paragraphs: [
              'All product listings, pack sizes, and USD pricing displayed on the Yummy Tummy storefront are subject to confirmation and availability at the time of order processing.',
              'Orders placed via EcoCash, Bank Transfer, or WhatsApp-assisted checkout are confirmed once payment or proof of payment is verified by our order desk.',
              'Wholesale and retail distribution partnerships are governed by agreed commercial terms issued upon enquiry review.',
            ],
          }
        : {
            title: 'Shipping & Returns',
            paragraphs: [
              'Delivery timelines depend on the selected Zimbabwe delivery option (Harare Standard, Harare Same-Day Express, Nationwide Courier, or Direct Collection).',
              'Because food and snack products are perishable consumables, opened packs cannot be returned unless damaged in transit or affected by a verified quality issue.',
              `If your order arrives damaged or incomplete, contact us within 24 hours of delivery at ${email} quoting your order reference.`,
            ],
          };

  return (
    <div className="bg-white py-14 lg:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5A524C] hover:text-[#F15A00] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Home</span>
        </button>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#35170D]">{content.title}</h1>
        <div className="space-y-4 text-base text-[#5A524C] leading-relaxed">
          {content.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
