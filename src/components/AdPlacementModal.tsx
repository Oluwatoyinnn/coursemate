import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2, Megaphone, ShieldCheck, Flame } from 'lucide-react';

interface AdPlacementModalProps {
  onClose: () => void;
}

export const AdPlacementModal: React.FC<AdPlacementModalProps> = ({ onClose }) => {
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('Gadgets & Tech');
  const [duration, setDuration] = useState<'1_week' | '2_weeks' | '1_month'>('1_week');
  const [targetLink, setTargetLink] = useState('');
  const [advertiserContact, setAdvertiserContact] = useState('');
  const [notes, setNotes] = useState('');

  const plans = [
    {
      id: '1_week',
      title: '1 Week Spotlight',
      price: '₦3,000',
      durationLabel: '7 Days Live',
      popular: true,
      description: 'Featured prominently on Home & Free Time finder cards with direct click-to-chat.',
    },
    {
      id: '2_weeks',
      title: '2 Weeks Campus Blast',
      price: '₦5,500',
      durationLabel: '14 Days Live',
      popular: false,
      description: 'Double the exposure during high-traffic test and continuous assessment weeks.',
    },
    {
      id: '1_month',
      title: '1 Month Full Partner (VIP)',
      price: '₦10,000',
      durationLabel: '30 Days Live',
      popular: true,
      description: 'Exclusive 30-Day VIP Perk: Dedicated In-App Showcase Hub + Direct 1-Click WhatsApp Lead Generator directly to your business phone number.',
    },
  ];

  const categories = [
    'Gadgets & Tech (Laptops, Phones, Repairs)',
    'Food, Drinks & Pastries',
    'Fashion, Thrift & Footwear',
    'Hostel Accommodation & Lodge Logistics',
    'Academic Tutorials & Exam Preps',
    'Printing, Photocopy & Cybercafe',
    'Beauty, Skincare & Grooming',
    'Campus Services & Freelancing',
  ];

  const selectedPlan = plans.find((p) => p.id === duration) || plans[0];

  const handleBookViaWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanBrand = brandName.trim() || 'My Business';
    const message = [
      `*Course Mate Ad Placement Booking*`,
      `*Reach 20,000+ FUNAABites*`,
      ``,
      `• *Brand / Business:* ${cleanBrand}`,
      `• *Category:* ${category}`,
      `• *Selected Package:* ${selectedPlan.title} (${selectedPlan.price} / ${selectedPlan.durationLabel})`,
      `• *Target Link / Social:* ${targetLink.trim() || 'Not specified'}`,
      `• *Advertiser Phone:* ${advertiserContact.trim() || 'Via this WhatsApp chat'}`,
      notes.trim() ? `• *Special Notes:* ${notes.trim()}` : null,
      ``,
      `Hello Course Mate Team, please send payment details and banner specs to get our ad live!`,
    ]
      .filter(Boolean)
      .join('\n');

    const whatsappUrl = `https://wa.me/2348128197651?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 dark:bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-gradient-to-r from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/40 dark:to-slate-900">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Campus Brand Promotion</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
              Promote Your Brand
            </h2>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold mt-0.5">
              Reach 20,000+ FUNAABites on their daily lecture schedule
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleBookViaWhatsApp} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Package Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Select Advertising Package
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {plans.map((p) => {
                const isSelected = duration === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setDuration(p.id as typeof duration)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" />
                        Popular
                      </span>
                    )}
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{p.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{p.durationLabel}</div>
                    </div>
                    <div className="mt-2 text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {p.price}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {selectedPlan.description}
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business / Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Spark Tech Hub, Buka Royale, Swift Laundry"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Link or WhatsApp Contact
                </label>
                <input
                  type="text"
                  value={targetLink}
                  onChange={(e) => setTargetLink(e.target.value)}
                  placeholder="e.g. instagram.com/mybrand or wa.me/234..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={advertiserContact}
                  onChange={(e) => setAdvertiserContact(e.target.value)}
                  placeholder="e.g. 08123456789"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ad Tagline / Promo Message (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Get 15% discount when you present this ad! Located at Gate 1."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Value Guarantee */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2.5 text-[11px] text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Guaranteed ad rotation, real student impressions, and clean non-intrusive placement.</span>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              <span>Send Booking Request on WhatsApp ({selectedPlan.price})</span>
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Opens WhatsApp with pre-filled details to finalize banner graphics and bank transfer.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
