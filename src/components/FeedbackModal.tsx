import React, { useState } from 'react';
import { OFFICIAL_METADATA } from '../data/timetable';
import { X, Send, MessageSquareText, ShieldAlert, Lightbulb, AlertCircle, FileText } from 'lucide-react';

interface FeedbackModalProps {
  initialContext?: {
    courseCode?: string;
    day?: string;
    time?: string;
    venue?: string;
    departmentId?: string;
  };
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  initialContext,
  onClose,
}) => {
  const [role, setRole] = useState<string>('Head of Class (HOC)');
  const [testerName, setTesterName] = useState('');
  const [department, setDepartment] = useState(initialContext?.departmentId || '');
  const [copied, setCopied] = useState(false);
  const [category, setCategory] = useState<'incorrect_info' | 'feature' | 'bug' | 'verification'>(
    initialContext?.courseCode ? 'incorrect_info' : 'verification'
  );
  const [courseCode, setCourseCode] = useState(initialContext?.courseCode || '');
  const [venue, setVenue] = useState(initialContext?.venue || '');
  const [day, setDay] = useState(initialContext?.day || '');
  const [message, setMessage] = useState('');

  const categoryLabels = {
    verification: 'Beta Test Verification / Approval',
    incorrect_info: 'Incorrect Timetable Information',
    feature: 'Feature Proposal / Idea',
    bug: 'Technical Glitch / Bug',
  };

  const generateReportText = () => {
    const divider = '━━━━━━━━━━━━━━━━━━━━━━';
    const lines = [
      `*FUNAAB COURSE MATE • LEADERSHIP FEEDBACK*`,
      divider,
      `*TESTER ROLE:* ${role}`,
    ];

    if (testerName.trim()) lines.push(`*NAME:* ${testerName.trim()}`);
    if (department.trim()) lines.push(`*DEPT / COLLEGE:* ${department.trim().toUpperCase()}`);

    lines.push(`*CATEGORY:* ${categoryLabels[category]}`);
    lines.push(`*TIMETABLE:* ${OFFICIAL_METADATA.academicYear} • ${OFFICIAL_METADATA.semester} (v${OFFICIAL_METADATA.timetableVersion})`);

    if (courseCode) lines.push(`*COURSE:* ${courseCode.toUpperCase()}`);
    if (venue) lines.push(`*VENUE:* ${venue.toUpperCase()}`);
    if (day) lines.push(`*DAY:* ${day}`);

    lines.push(divider);
    lines.push(`*REPORT / FEEDBACK DETAILS:*`);
    lines.push(message.trim() || 'Timetable verified and reviewed.');
    lines.push(divider);
    lines.push(`_Submitted via Course Mate Verification Channel_`);
    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateReportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSendWhatsApp = () => {
    const phone = '2348128197651';
    const encoded = encodeURIComponent(generateReportText());
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 dark:bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Community & Accuracy
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Send Feedback or Report Details
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            “Something not right? Course Mate is built to make student life easier. If you notice an incorrect class detail, missing information, or have an idea that would make the app better, tell us. We’re listening.”
          </p>

          {/* Tester Role & Department Identification */}
          <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2.5 text-xs">
            <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center justify-between">
              <span>Beta Tester Identification</span>
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">Leadership Channel</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  <option value="College President">College President</option>
                  <option value="Departmental President">Departmental President</option>
                  <option value="Head of Class (HOC)">Head of Class (HOC)</option>
                  <option value="Course Rep / Executive">Course Rep / Executive</option>
                  <option value="Student / Beta Tester">Student / Beta Tester</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department / College *
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. CYB, MCE, MCB, COLENG"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={testerName}
                  onChange={(e) => setTesterName(e.target.value)}
                  placeholder="e.g. Segun / HOC 300L"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Report Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'verification', label: 'Verify / Approve Timetable', icon: ShieldAlert },
                { id: 'incorrect_info', label: 'Report Incorrect Info', icon: AlertCircle },
                { id: 'feature', label: 'Suggest Feature', icon: Lightbulb },
                { id: 'bug', label: 'Report Bug / Glitch', icon: MessageSquareText },
              ].map((c) => {
                const isSelected = category === c.id;
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id as any)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-white font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context fields if reporting incorrect timetable info */}
          {category === 'incorrect_info' && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g. BIO 107"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. JAO 3 or BIO LAB"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Freeform Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tell us what happened *
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the discrepancy, new venue, or suggestion..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Formatted Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Verification Message Preview</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                {copied ? '✓ Copied to clipboard!' : 'Copy text'}
              </button>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] leading-relaxed border border-slate-200 dark:border-slate-800 select-none overflow-x-auto whitespace-pre-wrap">
              {generateReportText()}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>Feedback is sent directly to Lead Builder Sisco & TIMTEC coordination.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            {copied ? '✓ Copied' : 'Copy Report'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Close
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
