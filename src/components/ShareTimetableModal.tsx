import React, { useState } from 'react';
import { TimetableSession, UserProfile, TimetableDay } from '../types';
import { ACADEMIC_DAYS, parseTimeToMinutes, exportToICalendar, getCampusNow } from '../utils/scheduleLogic';
import { OFFICIAL_METADATA } from '../data/timetable';
import { BrandLogo } from './BrandLogo';
import {
  X,
  Copy,
  Check,
  Printer,
  Calendar,
  Download,
  ExternalLink,
  Share2,
  Clock,
  MapPin,
  Send,
} from 'lucide-react';

interface ShareTimetableModalProps {
  sessions: TimetableSession[];
  profile: UserProfile;
  onClose: () => void;
}

export const ShareTimetableModal: React.FC<ShareTimetableModalProps> = ({
  sessions,
  profile,
  onClose,
}) => {
  const campus = getCampusNow();
  const [copied, setCopied] = useState(false);
  const [calDownloaded, setCalDownloaded] = useState(false);
  const [shareScope, setShareScope] = useState<'today' | 'week'>(
    campus.isAcademicDay ? 'today' : 'week'
  );

  const activeDay = campus.isAcademicDay ? (campus.day as TimetableDay) : 'Monday';

  const generateShareText = () => {
    const studentLabel = profile.preferredName
      ? `${profile.preferredName}'s Schedule (${profile.level}L ${profile.departmentId})`
      : `FUNAAB ${profile.level}L Schedule`;

    if (shareScope === 'today') {
      const todaySessions = sessions
        .filter((s) => s.day === activeDay)
        .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

      let text = `*Course Mate — Today's Classes (${activeDay}, ${campus.fullDateStr.split(',')[1]?.trim() || ''})*\n`;
      text += `*${studentLabel} • FUNAAB First Semester*\n\n`;

      if (todaySessions.length === 0) {
        text += `_No official classes scheduled for today (${activeDay}). Enjoy your free study day!_\n\n`;
      } else {
        for (const s of todaySessions) {
          text += `• *${s.startTime} – ${s.endTime}*: *${s.courseCode}* @ ${s.venue} ${s.isPractical ? '[Practical]' : ''}\n`;
        }
        text += '\n';
      }

      text += `Directions: https://funaab.getdirection.xyz\n`;
      text += `_Built with Course Mate by Sisco: https://siscoask.vercel.app_`;
      return text;
    }

    // Full Week
    let text = `*Course Mate Timetable — ${studentLabel}*\n`;
    text += `Federal University of Agriculture, Abeokuta • 2026/2027 First Semester (v${OFFICIAL_METADATA.timetableVersion})\n\n`;

    for (const day of ACADEMIC_DAYS) {
      const daySessions = sessions
        .filter((s) => s.day === day)
        .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

      if (daySessions.length > 0) {
        text += `*== ${day.toUpperCase()} ==*\n`;
        for (const s of daySessions) {
          text += `• ${s.startTime} – ${s.endTime}: *${s.courseCode}* @ ${s.venue} ${s.isPractical ? '[Practical]' : ''}\n`;
        }
        text += '\n';
      }
    }

    text += `_Built with Course Mate by Sisco — Your academic day, simplified._\nhttps://siscoask.vercel.app`;
    return text;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDirectWhatsApp = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Course Mate Schedule — ${profile.preferredName || 'FUNAAB'}`,
          text: generateShareText(),
          url: window.location.href,
        });
        return;
      } catch {
        // User cancelled or unsupported
      }
    }
    handleDirectWhatsApp();
  };

  const handleDownloadICS = () => {
    const icsContent = exportToICalendar(sessions, profile.preferredName || 'FUNAAB Student');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `funaab-timetable-${profile.level}L-${Date.now()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCalDownloaded(true);
    setTimeout(() => setCalDownloaded(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 dark:bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              Share & Export Timetable
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
              Print official schedule, sync to phone calendar, or share on WhatsApp.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close share dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Scope Segmented Switcher */}
        <div className="px-3.5 sm:px-5 pt-3 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            Scope:
          </span>
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs w-full max-w-xs">
            <button
              onClick={() => setShareScope('today')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-center transition-all ${
                shareScope === 'today'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Today ({activeDay.slice(0, 3)})
            </button>
            <button
              onClick={() => setShareScope('week')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-center transition-all ${
                shareScope === 'week'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Full Week (Mon–Fri)
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-3.5 scrollbar-thin">
          {/* Calendar Sync Banner */}
          <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="min-w-0">
              <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Sync with Phone Calendar (.ics)</span>
              </span>
              <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 mt-0.5">
                One-tap import into Google Calendar or Apple Calendar.
              </p>
            </div>
            <button
              onClick={handleDownloadICS}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shrink-0 shadow-xs text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{calDownloaded ? 'Saved!' : 'Export .ics'}</span>
            </button>
          </div>

          {/* Share Card Container (Engineered to never distort on any mobile screen) */}
          <div
            id="shareable-card"
            className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xs space-y-3"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BrandLogo size="sm" showWordmark={true} showTagline={false} />
              </div>
              <div className="text-right text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                <span className="block text-[10px]">2026/2027 • Sem 1</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  v{OFFICIAL_METADATA.timetableVersion} TIMTEC
                </span>
              </div>
            </div>

            {/* Profile banner */}
            <div className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-stone-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Student
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {profile.preferredName ? profile.preferredName : 'FUNAAB Student'} ({profile.level}L {profile.departmentId})
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Scope
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {shareScope === 'today' ? `${activeDay}` : `${sessions.length} classes`}
                </span>
              </div>
            </div>

            {/* Schedule Overview */}
            <div className="space-y-3 pt-1">
              {(shareScope === 'today' ? [activeDay] : ACADEMIC_DAYS).map((day) => {
                const daySessions = sessions
                  .filter((s) => s.day === day)
                  .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

                if (daySessions.length === 0) {
                  if (shareScope === 'today') {
                    return (
                      <div key={day} className="text-xs text-slate-400 italic p-3 text-center rounded-lg bg-slate-50 dark:bg-slate-900">
                        No classes scheduled for {day}.
                      </div>
                    );
                  }
                  return null;
                }

                return (
                  <div key={day} className="text-xs space-y-1.5">
                    <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
                      <span className="uppercase text-[11px] tracking-wide">{day}</span>
                      <span className="text-[10px] font-normal text-slate-400 font-mono">
                        {daySessions.length} {daySessions.length === 1 ? 'class' : 'classes'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {daySessions.map((s) => (
                        <div
                          key={s.id}
                          className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-1"
                        >
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                              {s.courseCode}
                            </span>
                            <div className="flex items-center gap-1">
                              {s.isPractical && (
                                <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                                  Practical
                                </span>
                              )}
                              {s.isVirtual && (
                                <span className="text-[9px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded">
                                  Virtual
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono gap-2 pt-0.5">
                            <div className="flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{s.startTime} – {s.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1 font-sans font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{s.venue}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Card Footer with clean credits */}
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
              <div className="flex items-center justify-between">
                <span>Designed & built by <strong className="text-slate-800 dark:text-slate-200">Sisco</strong></span>
                <a
                  href="https://siscoask.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5 font-mono"
                >
                  <span>siscoask.vercel.app</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="text-[9px] text-slate-400 truncate">
                Sholuade AbdulRasak Akorede • Cyber Security, COLCOMPS • FUNAAB
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Bar (Responsive 3-button grid on mobile) */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="grid grid-cols-3 gap-2">
            {/* 1. Print Real Timetable */}
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors shadow-2xs"
              title="Print certified A4 academic timetable document or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="truncate">Print A4</span>
            </button>

            {/* 2. Direct WhatsApp / Native Share */}
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-semibold rounded-xl border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 transition-colors shadow-2xs"
              title="Share timetable to WhatsApp group or chats"
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">WhatsApp</span>
            </button>

            {/* 3. Copy Text */}
            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span className="truncate">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Copy Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
