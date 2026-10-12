import React, { useState } from 'react';
import { Home, Calendar, BookOpen, MoreHorizontal, MapPin, Coffee, CalendarPlus, Settings, MessageSquare, Megaphone, X } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenFeedback: () => void;
  onOpenAdModal?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenFeedback,
  onOpenAdModal,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'courses', label: 'Courses', icon: BookOpen },
  ];

  const handleTabClick = (tabId: string) => {
    setShowMoreMenu(false);
    onSelectTab(tabId);
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="grid grid-cols-4 h-14">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id && !showMoreMenu;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* More Menu Trigger */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
              showMoreMenu || ['venues', 'freetime', 'myschedule', 'settings'].includes(currentTab)
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
            <span>More</span>
          </button>
        </div>
      </div>

      {/* More Menu Drawer */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/25 dark:bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150">
          <div className="w-full bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                More Utilities
              </span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleTabClick('venues')}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-slate-800 dark:text-slate-200"
              >
                <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Venues Directory</span>
              </button>

              <button
                onClick={() => handleTabClick('freetime')}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-slate-800 dark:text-slate-200"
              >
                <Coffee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Free Time Finder</span>
              </button>

              <button
                onClick={() => handleTabClick('myschedule')}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-slate-800 dark:text-slate-200"
              >
                <CalendarPlus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Personal Schedule</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenFeedback();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-slate-800 dark:text-slate-200"
              >
                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Report / Feedback</span>
              </button>
            </div>

            {onOpenAdModal && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenAdModal();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-bold transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Promote Your Brand (Reach 20,000+)</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-amber-200/80 dark:bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-300">
                    ₦3,000/wk
                  </span>
                </button>
              </div>
            )}

            <div className="pt-0.5">
              <button
                onClick={() => handleTabClick('settings')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Settings, About & Credits</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
