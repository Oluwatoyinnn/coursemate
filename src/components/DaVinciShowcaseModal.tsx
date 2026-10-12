import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Ticket,
  Sparkles,
  Award,
  CheckCircle2,
  Share2,
  Star,
  Users,
  Smile,
} from 'lucide-react';

interface DaVinciShowcaseModalProps {
  onClose: () => void;
  onAdInteraction?: () => void;
}

export const DaVinciShowcaseModal: React.FC<DaVinciShowcaseModalProps> = ({
  onClose,
  onAdInteraction,
}) => {
  const ticketUrl = 'https://tickethub.ng/davinci-live-statistically-speaking-Ti4rsN/siscoask';

  const handleGetTickets = () => {
    onAdInteraction?.();
    window.open(ticketUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareEvent = () => {
    const text = `DaVinci Live: Statistically Speaking (FUNAAB Comedy Special) - Wed 11th Nov 2026 at CENTS Auditorium. Tickets from ₦3,000: ${ticketUrl}`;
    if (navigator.share) {
      navigator.share({
        title: 'DaVinci Live: Statistically Speaking @ FUNAAB',
        text,
        url: ticketUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Event details & ticket link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/25 dark:bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-3xl shadow-xl dark:shadow-2xl border border-orange-200 dark:border-2 dark:border-orange-500/40 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header with Close */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-orange-50/60 dark:bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 border border-orange-200 dark:border-orange-500/30">
              <Star className="w-3 h-3 text-orange-600 dark:text-orange-400 fill-orange-400" />
              <span>VIP 30-Day Campus Partner</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 hidden sm:inline">
              FUNAAB Concert Special
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Main Stage Banner & Typography */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-orange-50 via-white to-amber-50/60 dark:from-orange-600/30 dark:via-zinc-900 dark:to-black border border-orange-200 dark:border-orange-500/30 relative overflow-hidden">
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 font-mono">
                  WAVE INC. PRESENTS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-500/30 text-orange-800 dark:text-orange-200 font-mono font-bold">
                  Official Live In FUNAAB
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                DAVINCI LIVE: <span className="text-orange-600 dark:text-orange-400">STATISTICALLY SPEAKING</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 font-medium">
                A premier comedy special built around DaVinci&apos;s signature storytelling, sharp observations, and campus life.
              </p>
            </div>
          </div>

          {/* Quick Date, Time, Venue Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase">Confirmed Date</div>
                <div className="font-bold text-slate-900 dark:text-white">Wed, 11 Nov 2026</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase">Showtime</div>
                <div className="font-bold text-slate-900 dark:text-white">12:00 PM Prompt</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase">Venue</div>
                <div className="font-bold text-slate-900 dark:text-white truncate">CENTS Auditorium</div>
              </div>
            </div>
          </div>

          {/* About Event */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5" />
              <span>About The Comedy Special</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              <strong>DAVINCI LIVE IN FUNAAB: STATISTICALLY SPEAKING</strong> is a high-energy live performance built around Johnson David&apos;s (DaVinci) unfiltered comedy, hilarious academic realities, and relatable campus moments. Joined by guest comedians and surprise appearances for a one-of-a-kind night.
            </p>
          </div>

          {/* Ticket Tiers */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>Available Ticket Categories</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900/90 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Early Bird
                </div>
                <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
                  ₦3,000
                </div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Limited student quota</p>
              </div>

              <div className="p-3 rounded-2xl border-2 border-orange-300 dark:border-orange-500/50 bg-orange-50 dark:bg-orange-950/20 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300 flex items-center justify-between">
                  <span>Late Bird</span>
                  <span className="px-1.5 py-0.2 rounded bg-orange-100 dark:bg-orange-500/30 text-[9px] font-bold text-orange-800 dark:text-orange-200">
                    Popular
                  </span>
                </div>
                <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
                  ₦5,000
                </div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Standard general admission</p>
              </div>

              <div className="p-3 rounded-2xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>VIP</span>
                </div>
                <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
                  ₦10,000
                </div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Reserved seating & front access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Official Ticketing via Tickethub.ng</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShareEvent}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title="Share event details"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleGetTickets}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-black text-xs transition-colors shadow-lg shadow-orange-500/30"
            >
              <Ticket className="w-4 h-4" />
              <span>Get Tickets on Tickethub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
