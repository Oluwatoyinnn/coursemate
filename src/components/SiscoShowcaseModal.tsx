import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Laptop,
  Palette,
  Film,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SiscoShowcaseModalProps {
  onClose: () => void;
  onAdInteraction?: () => void;
}

export const SiscoShowcaseModal: React.FC<SiscoShowcaseModalProps> = ({
  onClose,
  onAdInteraction,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<'build' | 'design' | 'motion'>('build');
  const [showPosterZoom, setShowPosterZoom] = useState(false);

  const whatsappPhone = '2348128197651'; // 08128197651

  const tracks = [
    {
      id: 'build' as const,
      num: '01',
      title: 'BUILD',
      subtitle: 'AI-POWERED SOFTWARE DEVELOPMENT',
      description: 'Build websites, web apps & software tools with AI from scratch.',
      curriculum: [
        'Prompt-to-Code architecture & full-stack web scaffolding',
        'Deploying responsive, production-ready web apps',
        'Database & API integration with modern AI coding engines',
        'Building client projects you can freelance and monetize',
      ],
      originalPrice: '₦45,000',
      discountPrice: '₦35,000',
      savings: '₦10,000 OFF',
      icon: Laptop,
      badgeColor: 'bg-indigo-600',
      ctaText: 'Apply for BUILD Track (₦35K)',
      waMsg: 'Hello The Sisco Initiative! I saw your program on Course Mate. I want to secure my spot for Track 01: BUILD (AI Software Development) with the ₦10,000 First Cohort subsidy.',
    },
    {
      id: 'design' as const,
      num: '02',
      title: 'DESIGN',
      subtitle: 'AI-ASSISTED GRAPHICS DESIGN',
      description: 'Create graphics, brand visuals & digital commercial content with AI.',
      curriculum: [
        'AI generative imagery, high-end compositing & aesthetics',
        'Brand identities, social media visual systems & mockups',
        'Commercial flyer & billboard creation with precision typography',
        'Exporting print-ready & digital client deliverables',
      ],
      originalPrice: '₦35,000',
      discountPrice: '₦25,000',
      savings: '₦10,000 OFF',
      icon: Palette,
      badgeColor: 'bg-purple-600',
      ctaText: 'Apply for DESIGN Track (₦25K)',
      waMsg: 'Hello The Sisco Initiative! I saw your program on Course Mate. I want to secure my spot for Track 02: DESIGN (AI Graphics Design) with the ₦10,000 First Cohort subsidy.',
    },
    {
      id: 'motion' as const,
      num: '03',
      title: 'MOTION',
      subtitle: 'AI VIDEO CREATION',
      description: 'Create engaging videos, cinematic scenes & viral content with AI.',
      curriculum: [
        'AI script-to-video pipelines & cinematic camera controls',
        'Dynamic motion transitions, sound design & voiceovers',
        'Viral short-form reels & high-converting brand promo clips',
        'Monetizing video content for clients, creators & brands',
      ],
      originalPrice: '₦40,000',
      discountPrice: '₦30,000',
      savings: '₦10,000 OFF',
      icon: Film,
      badgeColor: 'bg-violet-600',
      ctaText: 'Apply for MOTION Track (₦30K)',
      waMsg: 'Hello The Sisco Initiative! I saw your program on Course Mate. I want to secure my spot for Track 03: MOTION (AI Video Creation) with the ₦10,000 First Cohort subsidy.',
    },
  ];

  const handleEnrollClick = (msg: string) => {
    onAdInteraction?.();
    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const activeTrackData = tracks.find((t) => t.id === selectedTrack) || tracks[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 dark:bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[94dvh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-gradient-to-r from-purple-50 via-white to-amber-50/60 dark:from-purple-900 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-white">
          <div className="flex items-center gap-3">
            {/* Sisco Initiative Logo Mark */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-purple-500 to-indigo-700 flex items-center justify-center font-black text-white text-base shadow-md shrink-0">
              <Zap className="w-5 h-5 text-amber-200 fill-amber-300" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400 text-purple-950 shadow-2xs font-mono">
                  30-Day Campus Spotlight
                </span>
                <span className="text-[11px] font-mono text-purple-700 dark:text-purple-200">First Cohort Open</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
                THE SISCO INITIATIVE
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-purple-200/90 font-medium">
                Practical Digital Skills For A Brighter Tomorrow • Learn • Create • Earn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-purple-200 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Hero Banner Headline */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-white dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900 border border-purple-200/80 dark:border-purple-900/60 shadow-2xs space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800 dark:text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>THE FUTURE IS CREATIVE INTELLIGENCE</span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
              AI ISN’T THE SKILL. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600">
                WHAT YOU CAN DO WITH IT IS.
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
              Learn to BUILD. DESIGN. CREATE in 4 intense, practical weeks.
            </p>

            {/* Quick Specs Pill Row */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-semibold shadow-2xs">
                <Calendar className="w-3 h-3 text-purple-600" />
                4 Weeks Each
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-semibold shadow-2xs">
                <Laptop className="w-3 h-3 text-indigo-600" />
                Live Online Training
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-semibold shadow-2xs">
                <Layers className="w-3 h-3 text-amber-600" />
                Real Portfolio Projects
              </span>
            </div>
          </div>

          {/* Program Track Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Select Your Program Track</span>
              </h4>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                First Cohort ₦10K Subsidy
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {tracks.map((t) => {
                const isSelected = selectedTrack === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTrack(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-purple-600 dark:border-purple-500 bg-purple-50/80 dark:bg-purple-950/50 shadow-xs ring-2 ring-purple-600/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        {t.num}
                      </span>
                      <Icon
                        className={`w-4 h-4 ${
                          isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'
                        }`}
                      />
                    </div>
                    <div className="font-black text-sm text-slate-900 dark:text-white tracking-tight">
                      {t.title}
                    </div>
                    <div className="text-[11px] font-mono font-bold text-purple-700 dark:text-purple-300 mt-0.5">
                      {t.discountPrice}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Track Deep Dive Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                  TRACK {activeTrackData.num} • {activeTrackData.subtitle}
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {activeTrackData.title} Track
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {activeTrackData.description}
                </p>
              </div>

              {/* Price & Discount Box */}
              <div className="sm:text-right shrink-0 bg-purple-50 dark:bg-purple-950/40 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/50">
                <div className="text-[10px] font-mono text-slate-400 line-through">
                  Regular: {activeTrackData.originalPrice}
                </div>
                <div className="text-lg font-black text-purple-900 dark:text-purple-200 font-mono leading-none mt-0.5">
                  {activeTrackData.discountPrice}
                </div>
                <div className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-400/90 text-purple-950 font-bold text-[9px] uppercase tracking-wider">
                  {activeTrackData.savings}
                </div>
              </div>
            </div>

            {/* Curriculum Highlights */}
            <div className="space-y-2">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                What You Will Master & Build:
              </span>
              <ul className="space-y-1.5">
                {activeTrackData.curriculum.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct 1-Click WhatsApp CTA */}
            <button
              onClick={() => handleEnrollClick(activeTrackData.waMsg)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>{activeTrackData.ctaText} via WhatsApp</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Trust Badges & Direct WhatsApp Support */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Direct WhatsApp Admission Line:
                </span>{' '}
                <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                  08128197651
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px]">
              <span>Follow:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                @thesiscoinitiative
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-mono">
            FUNAAB Campus Partner Spotlight (30 Days)
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
