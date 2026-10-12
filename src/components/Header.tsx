import React, { useState, useRef, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Moon,
  Sun,
  ShieldCheck,
  ChevronDown,
  MapPin,
  Coffee,
  CalendarPlus,
  Settings,
  MessageSquare,
  Megaphone,
  Calendar,
  Calculator,
  Compass,
  MoreVertical,
} from 'lucide-react';
import { OFFICIAL_METADATA } from '../data/timetable';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenFeedback?: () => void;
  onOpenAdModal?: () => void;
  onOpenAcademicCalendar?: () => void;
  onOpenCGPAEstimator?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  darkMode,
  onToggleDarkMode,
  onOpenFeedback,
  onOpenAdModal,
  onOpenAcademicCalendar,
  onOpenCGPAEstimator,
}) => {
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close tools dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary 4 tabs visible directly in desktop nav
  const primaryTabs = [
    { id: 'home', label: 'Home' },
    { id: 'timetable', label: 'Timetable' },
    { id: 'courses', label: 'Courses' },
    { id: 'venues', label: 'Venues' },
  ];

  // Secondary tools housed in sleek Explore dropdown
  const secondaryTabs = [
    { id: 'freetime', label: 'Free Time Scout', icon: Coffee },
    { id: 'myschedule', label: 'My Schedule', icon: CalendarPlus },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const isSecondaryActive = secondaryTabs.some((t) => t.id === currentTab);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-2.5">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center text-left focus-visible:outline-none"
          >
            <BrandLogo size="md" showWordmark={true} showTagline={false} />
          </button>

          {/* Official Version Badge (Desktop only) */}
          <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 pl-3 border-l border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>2026/2027 v{OFFICIAL_METADATA.timetableVersion}</span>
          </div>
        </div>

        {/* Desktop & Tablet Navigation (Streamlined 4 core tabs + Explore tools dropdown) */}
        <nav className="hidden md:flex items-center gap-1">
          {primaryTabs.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Explore Tools Dropdown (Free Time, My Schedule, CGPA, Calendar, Settings) */}
          <div className="relative" ref={toolsRef}>
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                isSecondaryActive || toolsOpen
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>Explore</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
            </button>

            {toolsOpen && (
              <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in duration-100">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Campus Tools
                </div>

                {secondaryTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onSelectTab(tab.id);
                        setToolsOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2 transition-colors ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                {onOpenCGPAEstimator && (
                  <button
                    onClick={() => {
                      onOpenCGPAEstimator();
                      setToolsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold flex items-center gap-2 transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Calculator className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>5.0 CGPA Estimator</span>
                  </button>
                )}

                {onOpenAcademicCalendar && (
                  <button
                    onClick={() => {
                      onOpenAcademicCalendar();
                      setToolsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold flex items-center gap-2 transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>2026/27 Calendar</span>
                  </button>
                )}

                {onOpenFeedback && (
                  <button
                    onClick={() => {
                      onOpenFeedback();
                      setToolsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold flex items-center gap-2 transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>Feedback & Report</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Icons (Clean & Compact) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick CGPA Estimator */}
          {onOpenCGPAEstimator && (
            <button
              onClick={onOpenCGPAEstimator}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors shadow-2xs"
              title="FUNAAB 5.0 CGPA Goal Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">CGPA</span>
            </button>
          )}

          {/* Partner / Promote Placement Chip */}
          {onOpenAdModal && (
            <button
              onClick={onOpenAdModal}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/80 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-bold transition-colors shadow-2xs"
              title="Promote your brand to 20,000+ FUNAABites"
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Partner</span>
            </button>
          )}

          {/* Academic Calendar Button */}
          {onOpenAcademicCalendar && (
            <button
              onClick={onOpenAcademicCalendar}
              className="hidden sm:inline-flex p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              title="Official 2026/2027 Academic Session Calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </button>
          )}

          <div className="hidden sm:block">
            <PWAInstallButton />
          </div>

          {/* Phone-only "More" menu: keeps the header on one line on narrow screens */}
          <div className="relative sm:hidden" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="More options"
              aria-expanded={moreOpen}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {moreOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50">
                {onOpenCGPAEstimator && (
                  <button
                    onClick={() => { setMoreOpen(false); onOpenCGPAEstimator(); }}
                    className="w-full px-3 py-2.5 text-xs font-semibold flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    CGPA Calculator
                  </button>
                )}
                {onOpenAcademicCalendar && (
                  <button
                    onClick={() => { setMoreOpen(false); onOpenAcademicCalendar(); }}
                    className="w-full px-3 py-2.5 text-xs font-semibold flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Academic Calendar
                  </button>
                )}
                {onOpenAdModal && (
                  <button
                    onClick={() => { setMoreOpen(false); onOpenAdModal(); }}
                    className="w-full px-3 py-2.5 text-xs font-semibold flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Megaphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Partner with us
                  </button>
                )}
                {onOpenFeedback && (
                  <button
                    onClick={() => { setMoreOpen(false); onOpenFeedback(); }}
                    className="w-full px-3 py-2.5 text-xs font-semibold flex items-center gap-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    Send feedback
                  </button>
                )}
                <div className="px-3 pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800 empty:hidden">
                  <PWAInstallButton className="w-full justify-center" />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onToggleDarkMode}
            className="shrink-0 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
