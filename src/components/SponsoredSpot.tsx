import React, { useState, useEffect, useRef } from 'react';
import { ActiveAd } from '../types';
import activeAdsData from '../data/activeAds.json';
import {
  Megaphone,
  ExternalLink,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Award,
} from 'lucide-react';

interface SponsoredSpotProps {
  onOpenAdModal: () => void;
  onOpenSiscoShowcase?: () => void;
  onOpenDaVinciShowcase?: () => void;
  onAdInteraction?: () => void;
  variant?: 'home' | 'freetime' | 'compact';
}

export const SponsoredSpot: React.FC<SponsoredSpotProps> = ({
  onOpenAdModal,
  onOpenSiscoShowcase,
  onOpenDaVinciShowcase,
  onAdInteraction,
  variant = 'home',
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Active verified sponsor ads
  const now = new Date();
  const validAds: ActiveAd[] = (activeAdsData as ActiveAd[]).filter((ad) => {
    if (!ad.active) return false;
    const end = new Date(ad.endDate);
    return end >= now;
  });

  // Slide items: each verified ad, followed by the "Promote Your Brand" callout slide
  const totalSlides = validAds.length + 1; // 2 ads + 1 promo slide = 3 slides

  // 7-second automatic carousel rotation
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
    }, 7000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isPaused, totalSlides]);

  const handleActionClick = (ad: ActiveAd) => {
    onAdInteraction?.();
    if (ad.actionUrl === 'sisco-showcase' || ad.modalType === 'sisco-showcase') {
      if (onOpenSiscoShowcase) {
        onOpenSiscoShowcase();
        return;
      }
    }
    if (ad.actionUrl === 'davinci-showcase' || ad.modalType === 'davinci-showcase') {
      if (onOpenDaVinciShowcase) {
        onOpenDaVinciShowcase();
        return;
      }
    }
    if (ad.whatsappNumber) {
      const msg = encodeURIComponent(
        ad.whatsappMessage || `Hello ${ad.brandName}! I saw your brand on Course Mate.`
      );
      window.open(`https://wa.me/${ad.whatsappNumber}?text=${msg}`, '_blank', 'noopener,noreferrer');
      return;
    }
    if (ad.actionUrl.startsWith('http') || ad.actionUrl.startsWith('https')) {
      window.open(ad.actionUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://${ad.actionUrl}`, '_blank', 'noopener,noreferrer');
    }
  };

  const isPromoSlide = currentSlideIndex >= validAds.length;
  const currentAd = !isPromoSlide ? validAds[currentSlideIndex] : null;

  if (variant === 'compact') {
    return (
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
            {currentAd ? currentAd.brandName : 'Promote your brand on Course Mate'}
          </span>
        </div>
        <button
          onClick={() => (currentAd ? handleActionClick(currentAd) : onOpenAdModal())}
          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline shrink-0"
        >
          View
        </button>
      </div>
    );
  }

  // Determine container styling based on current brand identity
  const getContainerClasses = () => {
    if (isPromoSlide) {
      return 'border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/20 text-slate-900 dark:text-white shadow-2xs';
    }
    if (currentAd?.id === 'sisco-initiative-cohort-1') {
      // The Sisco Initiative: VIP campus partner (purple & gold accents)
      return 'border border-purple-200 dark:border-2 dark:border-amber-400/60 bg-white dark:bg-gradient-to-r dark:from-[#21093e] dark:via-[#150529] dark:to-[#2c0b52] text-slate-900 dark:text-white shadow-sm dark:shadow-xl dark:shadow-purple-950/30';
    }
    if (currentAd?.id === 'davinci-live-statistically-speaking') {
      // DaVinci Live Comedy Special: Live Stage Orange & Deep Charcoal
      return 'border border-orange-200 dark:border-2 dark:border-orange-500/50 bg-white dark:bg-gradient-to-r dark:from-zinc-950 dark:via-zinc-900 dark:to-orange-950/40 text-slate-900 dark:text-white shadow-sm dark:shadow-lg dark:shadow-orange-950/30';
    }
    return 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs';
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`p-4 sm:p-5 rounded-2xl relative overflow-hidden transition-all duration-300 ${getContainerClasses()}`}
    >
      {/* Header bar with custom brand indicators */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-2">
          {/* Brand Badge */}
          {currentAd?.id === 'sisco-initiative-cohort-1' ? (
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-amber-400/20 border border-purple-200 dark:border-amber-400/50 text-purple-800 dark:text-amber-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              <span>The Sisco Initiative • VIP 30-Day Campus Partner</span>
            </span>
          ) : currentAd?.id === 'davinci-live-statistically-speaking' ? (
            <span className="px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/40 text-orange-700 dark:text-orange-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Ticket className="w-3 h-3 text-orange-500 dark:text-orange-400" />
              <span>WAVE INC. PRESENTS • VIP 30-Day Campus Partner</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Megaphone className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Campus Brand Network</span>
            </span>
          )}

          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
            <span>Official 2026/2027 Partner</span>
          </span>
        </div>

        {/* Carousel Slide Indicators & Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 mr-1">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlideIndex === idx
                    ? currentAd?.id === 'sisco-initiative-cohort-1'
                      ? 'w-5 bg-amber-400'
                      : currentAd?.id === 'davinci-live-statistically-speaking'
                      ? 'w-5 bg-orange-400'
                      : 'w-5 bg-amber-500'
                    : 'w-1.5 bg-slate-400/30 hover:bg-slate-400/60'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1))}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % totalSlides)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide Body */}
      <div className="pt-3 min-h-[105px] flex flex-col justify-between">
        {!isPromoSlide && currentAd ? (
          currentAd.id === 'sisco-initiative-cohort-1' ? (
            /* BRAND A: THE SISCO INITIATIVE (IMPERIAL PURPLE & RADIANT GOLD) */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>The Sisco Initiative</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-400/20 border border-amber-300 dark:border-amber-400/40 text-amber-800 dark:text-amber-300 font-bold">
                    Cohort 1 • ₦10,000 Subsidy Active
                  </span>
                </div>
                <p className="text-xs text-purple-700 dark:text-amber-300 font-extrabold uppercase tracking-wide">
                  &ldquo;AI ISN&apos;T THE SKILL. WHAT YOU CAN DO WITH IT IS.&rdquo;
                </p>
                <p className="text-[11px] text-slate-600 dark:text-purple-100 leading-relaxed">
                  Learn to BUILD, DESIGN, and CREATE in 4 Weeks. 3 Practical AI programs: AI Software Development, Graphics Design, and Video Creation with ₦10k student subsidy.
                </p>
              </div>

              <button
                onClick={() => handleActionClick(currentAd)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-colors shrink-0 shadow-lg shadow-amber-400/25 self-start sm:self-auto"
              >
                <span>Explore Programs (₦10,000 OFF)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* BRAND B: DAVINCI LIVE COMEDY SPECIAL (STAGE CONCERT ORANGE & BLACK) */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="text-orange-600 dark:text-orange-400">DAVINCI LIVE:</span>
                    <span>STATISTICALLY SPEAKING</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-800/80 text-orange-700 dark:text-orange-300 font-bold">
                    Comedy Special in FUNAAB
                  </span>
                </div>

                {/* Event Highlights Pill */}
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-orange-700 dark:text-orange-200 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                    <span>Wed 11 Nov 2026</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                    <span>12:00 PM</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                    <span>CENTS Auditorium</span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  The Biggest Comedy Concert of the Year in FUNAAB. Early Bird ₦3,000 • Regular ₦5,000 • VIP ₦10,000. Secure seats before tickets sell out!
                </p>
              </div>

              <button
                onClick={() => handleActionClick(currentAd)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-black text-xs transition-colors shrink-0 shadow-lg shadow-orange-500/25 self-start sm:self-auto"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Get Tickets (from ₦3,000)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        ) : (
          /* SLIDE 3: PROMOTE YOUR BRAND BILLBOARD */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300 text-slate-900 dark:text-white">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Promote Your Brand on Course Mate</span>
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                  20,000+ Daily Reach
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                Feature your business, food joint, comedy show, tech service, or tutorials to students daily.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Direct in-app banner placement with WhatsApp or website checkout integration.
              </p>
            </div>

            <button
              onClick={onOpenAdModal}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors shrink-0 shadow-xs self-start sm:self-auto"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Book Ad Placement</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
