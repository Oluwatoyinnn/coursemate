import React from 'react';
import { TimetableSession, UserProfile } from '../types';
import { ACADEMIC_DAYS, parseTimeToMinutes, getCampusNow } from '../utils/scheduleLogic';
import { OFFICIAL_METADATA, OFFICIAL_VENUES } from '../data/timetable';
import { getCourseMeaning } from '../utils/courseMeanings';

interface PrintableTimetableProps {
  sessions: TimetableSession[];
  profile: UserProfile;
}

export const PrintableTimetable: React.FC<PrintableTimetableProps> = ({ sessions, profile }) => {
  const campus = getCampusNow();

  // Sort sessions chronologically for each day
  const sortedByDay = ACADEMIC_DAYS.map((day) => {
    const daySessions = sessions
      .filter((s) => s.day === day)
      .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
    return { day, sessions: daySessions };
  });

  // Extract unique venues in student's schedule
  const uniqueVenueNames = Array.from(new Set(sessions.map((s) => s.venue)));
  const venueDetails = uniqueVenueNames.map((name) => {
    const found = OFFICIAL_VENUES.find((v) => v.name.toLowerCase() === name.toLowerCase());
    return {
      name,
      building: found ? found.building : 'Campus Venue',
      type: found ? found.type : 'Lecture Space',
    };
  });

  // Unique course codes
  const uniqueCourses = Array.from(new Set(sessions.map((s) => s.courseCode.toUpperCase())));

  return (
    <div id="funaab-printable-document" className="hidden print:block w-full bg-white text-slate-900 p-8 font-sans">
      {/* Official Institutional Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center">
        <div className="text-[11px] font-bold tracking-widest uppercase text-slate-600 mb-0.5">
          Federal Republic of Nigeria
        </div>
        <h1 className="text-xl font-black tracking-tight uppercase text-slate-950 font-serif">
          Federal University of Agriculture, Abeokuta
        </h1>
        <div className="text-xs font-bold uppercase tracking-wider text-indigo-950 mt-0.5">
          Central Timetable and Examinations Committee (TIMTEC)
        </div>
        <div className="text-xs font-semibold text-slate-700 mt-1">
          {OFFICIAL_METADATA.academicYear} Academic Session • First Semester Lecture & Practical Schedule
        </div>
        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
          Official Master Version: <strong>v{OFFICIAL_METADATA.timetableVersion}</strong> • Certified TIMTEC Release
        </div>
      </div>

      {/* Student Profile & Meta Information Banner */}
      <div className="grid grid-cols-3 gap-3 p-3.5 border border-slate-300 rounded-lg bg-slate-50/70 mb-5 text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Student Name</span>
          <span className="font-bold text-slate-900 text-sm">
            {profile.preferredName ? profile.preferredName : 'FUNAAB Student'}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Academic Level & College</span>
          <span className="font-semibold text-slate-900">
            {profile.level} Level • {profile.collegeId || 'General'}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Department / Program</span>
          <span className="font-semibold text-slate-900">
            {profile.departmentId || 'Undergraduate Degree'}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Weekly Load</span>
          <span className="font-semibold text-slate-800">
            {sessions.length} scheduled class {sessions.length === 1 ? 'period' : 'periods'} ({uniqueCourses.length} courses)
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Generated On</span>
          <span className="font-mono text-slate-800">
            {campus.fullDateStr} • {campus.timeStr} WAT
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Campus Directions</span>
          <span className="text-indigo-800 font-medium">funaab.getdirection.xyz</span>
        </div>
      </div>

      {/* Complete Weekly Schedule Table */}
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
          Weekly Lecture & Practical Rotations
        </h2>

        <table className="w-full border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold">
              <th className="border border-slate-300 p-2 text-left w-24">Day</th>
              <th className="border border-slate-300 p-2 text-left w-36">Time Window</th>
              <th className="border border-slate-300 p-2 text-left w-24">Course</th>
              <th className="border border-slate-300 p-2 text-left">Course Title & Mode</th>
              <th className="border border-slate-300 p-2 text-left w-36">Venue / Space</th>
            </tr>
          </thead>
          <tbody>
            {sortedByDay.map(({ day, sessions: daySessions }) => {
              if (daySessions.length === 0) {
                return (
                  <tr key={day} className="border-b border-slate-200">
                    <td className="border border-slate-300 p-2 font-bold text-slate-900 align-top bg-slate-50">
                      {day}
                    </td>
                    <td colSpan={4} className="border border-slate-300 p-2 text-slate-500 italic">
                      {day === 'Wednesday'
                        ? 'No morning classes. Official University Sports Period (2:00 PM – 6:00 PM).'
                        : 'No official classes scheduled for this day (Independent Study / Free Time).'}
                    </td>
                  </tr>
                );
              }

              return daySessions.map((s, idx) => {
                const title = getCourseMeaning(s.courseCode);
                return (
                  <tr
                    key={s.id}
                    className={`border-b border-slate-200 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    {idx === 0 ? (
                      <td
                        rowSpan={daySessions.length}
                        className="border border-slate-300 p-2 font-bold text-slate-900 align-top bg-slate-50/80"
                      >
                        {day}
                        <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                          {daySessions.length} {daySessions.length === 1 ? 'class' : 'classes'}
                        </span>
                      </td>
                    ) : null}

                    <td className="border border-slate-300 p-2 font-mono text-[11px] font-semibold text-slate-800 whitespace-nowrap">
                      {s.startTime} – {s.endTime}
                    </td>

                    <td className="border border-slate-300 p-2 font-bold text-slate-900">
                      {s.courseCode}
                    </td>

                    <td className="border border-slate-300 p-2">
                      <div className="font-semibold text-slate-800">{title}</div>
                      <div className="text-[10px] text-slate-600 flex items-center gap-1.5 mt-0.5">
                        {s.isPractical && (
                          <span className="font-bold text-emerald-800 uppercase tracking-wider">
                            [Laboratory Practical]
                          </span>
                        )}
                        {s.isVirtual && (
                          <span className="font-bold text-indigo-800 uppercase tracking-wider">
                            [Virtual Component]
                          </span>
                        )}
                        {!s.isPractical && !s.isVirtual && (
                          <span>Physical In-Person Lecture</span>
                        )}
                      </div>
                    </td>

                    <td className="border border-slate-300 p-2 font-semibold text-slate-800">
                      {s.venue}
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>

      {/* Venue Legend & Campus Directory for scheduled classes */}
      {venueDetails.length > 0 && (
        <div className="mb-5 p-3.5 border border-slate-300 rounded-lg text-xs break-inside-avoid">
          <h3 className="font-bold uppercase tracking-wider text-slate-800 text-[11px] mb-1.5">
            Campus Venues In Your Timetable ({venueDetails.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            {venueDetails.map((v) => (
              <div key={v.name} className="border-l-2 border-indigo-600 pl-2">
                <span className="font-bold text-slate-900 block">{v.name}</span>
                <span className="text-slate-600">{v.building} • {v.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Guidelines & Notes */}
      <div className="border border-slate-300 rounded-lg p-3 text-[11px] text-slate-700 space-y-1 mb-6 break-inside-avoid bg-slate-50/50">
        <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
          Academic & Campus Regulations (TIMTEC Notes)
        </div>
        <p>
          1. <strong>Sports Period:</strong> Wednesday 2:00 PM – 6:00 PM is reserved university-wide for sports and co-curricular programs.
        </p>
        <p>
          2. <strong>Laboratories & Practicals:</strong> Students attending practical sessions must report with approved lab coats and identification.
        </p>
        <p>
          3. <strong>Punctuality & Clashes:</strong> Lectures commence at 8:00 AM promptly. For venue navigation and directions, consult <strong>funaab.getdirection.xyz</strong>.
        </p>
      </div>

      {/* Document Footer & Attributions */}
      <div className="pt-3 border-t-2 border-slate-900 flex items-center justify-between text-[10px] text-slate-600 font-mono">
        <div>
          <span>Official FUNAAB Lecture Timetable System</span>
          <span className="block text-slate-500">Certified by TIMTEC v{OFFICIAL_METADATA.timetableVersion}</span>
        </div>
        <div className="text-right">
          <span>Course Mate by Sisco (COLCOMPS)</span>
          <span className="block text-slate-500">https://siscoask.vercel.app • funaab101.xyz</span>
        </div>
      </div>
    </div>
  );
};
