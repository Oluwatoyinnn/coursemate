# Course Mate

**Your academic day, simplified.** Course Mate is a free, installable web app for FUNAAB students. It turns the official TIMTEC lecture timetable into a personal planner: what's next, where it holds, and where you can sit when you're free.

Built by **Sisco Ask**. Data source: *TIMTEC 2026/2027 First Semester Lecture Time-Table, Version 4.0*.

---

## What it does

- **Personal timetable.** Pick your college, department and level, then choose your courses. Daily, weekly, compact and agenda views.
- **Next class card.** Always shows what's happening now or what's next, with time left and a directions link.
- **Courses and venues.** Search any course code or title. Browse every venue with its building and capacity.
- **Free Time Finder.** Shows the gaps between your classes.
- **Empty Venue Finder.** Checks the whole campus (every level and department) and lists rooms with no timetabled class in the window you choose.
- **Edit my timetable.** Remove a class, change its day, time or venue, or add your own. Changes are saved on the device only, the official data is never touched, and there is Undo and Reset.
- **My Schedule.** Add personal events (study, meetings) next to your lectures. Clash warnings included.
- **Reminders.** Class alerts as a phone notification, a chime and an in-app banner. Settings save instantly and include a "Send a test reminder" button.
- **Extras.** CGPA goal calculator, academic calendar, share and print your timetable.
- **Auto, Day and Dark themes.** Auto follows the phone or computer's light/dark setting. Plus colour skins.
- **Groups.** For courses split into groups (A, B, C…) students pick their own group once, so the right venue shows.
- **Live student counter** ("Students on Course Mate"). Optional; see `docs/live-counter-setup.md`.
- **Works offline.** Installable as an app (PWA), with a "new version available" prompt. Your data stays on your device: no login, no account.

---

## Tech stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 4 · lucide-react · vite-plugin-pwa

---

## Run it on your computer

You need **Node.js 18 or newer** ([nodejs.org](https://nodejs.org)).

```bash
npm install
npm run dev
```

Open the address the terminal prints (normally `http://localhost:3000`).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with live reload |
| `npm run build` | Make the production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Type-check the whole project (finds mistakes before you run it) |
| `npm run clean` | Delete the `dist/` folder |

> If the terminal says port 3001 instead of 3000, an older copy is still running. Close it first.

---

## Project map (where things live)

```
src/
  App.tsx                  App shell, routing between pages, modals
  index.css                Day/dark colours and the colour themes
  data/
    timetable.ts             Colleges, departments, venues, course titles, all sessions
    timetableData.json       Raw timetable (1,377 sessions)
    activeAds.json           Sponsor banners (dates, text, links)
    academicCalendar.ts      Semester calendar events
  pages/                   Home, Timetable, Courses, Venues, FreeTime, MySchedule, Settings
  components/              Header, BottomNav, modals, timetable views, sponsor banners
  utils/
    scheduleLogic.ts         Next-class, gaps and clash maths
    venueAvailability.ts     Empty-venue logic
    liveCount.ts             Anonymous live student counter (needs the Supabase setup)
  components/TimetableEditorModal.tsx   The "Edit my timetable" screen
  components/UpdatePrompt.tsx           Offline-ready and update messages
    storage.ts               Saves your profile and events on-device
docs/                      Setup guides (live counter)
public/sw-extra.js           Extra service-worker code (tapping a reminder opens the app)
public/                    App icons, favicon and sponsor images (the manifest is built by vite.config.ts)
vite.config.ts             Build config and PWA manifest (name, colours, icons)
```

---

## Updating the timetable (e.g. a new TIMTEC version)

1. Edit or replace the sessions in `src/data/timetableData.json` and `src/data/timetable.ts`.
2. Update the version number in `OFFICIAL_METADATA` (top of `timetable.ts`) so the header shows the right one.
3. Run `npm run lint`, then `npm run dev` and spot-check a few courses against the PDF.

---

## Live student counter

The counter stays hidden until you connect a free Supabase project. Follow **`docs/live-counter-setup.md`**
(about 10 minutes). It stores only a random anonymous ID per device and never shows a made-up number.

---

## Deploying

This repo includes a GitHub Pages workflow (`.github/workflows/deploy.yml`).

1. Push to GitHub on the `main` branch.
2. In the repo go to **Settings → Pages → Source** and choose **GitHub Actions**.
3. Every push to `main` rebuilds and publishes the site automatically.
4. Optional: add the two `VITE_SUPABASE_*` secrets (see the counter guide) so the deployed site shows the live count.

It also deploys without changes to Vercel or Netlify (build command `npm run build`, output folder `dist`).

---

## Reminders: what to expect

Reminders fire while Course Mate is open or running in the background (and the moment you return to it). Phones can
freeze apps to save battery, so a fully closed app cannot ring. Alerts that work with the app completely closed need a
push server, which is not part of this version. On iPhone, add the app to the Home Screen first.

---

## Notes

- The Empty Venue Finder only knows the lecture timetable. "Free" means *no timetabled class*, not a guaranteed free room. Exams and events are not included.
- Student data (name, courses, events, settings) is stored only in the browser on the user's own device.

---

## Credits

Designed and developed by **Sisco Ask** · [siscoask.vercel.app](https://siscoask.vercel.app)

Timetable data © Federal University of Agriculture, Abeokuta (TIMTEC). This app is an independent student utility.

## Department corrections

`src/data/departmentOverrides.ts` holds corrections that apply to one department and level only (currently Cyber Security 100L: Statistics in CAD, MTS 101 in the 1000 CAP LT, CYB 113 in the Software Engineering Lab 11 AM to 1 PM, GST 111 on Friday only, all classes physical). The official dataset is never edited, so every other department keeps what TIMTEC published.

## Testing the install button and offline mode on your computer

The install icon never appears on `npm run dev` (PWA is off in dev on purpose, so old cached files can't confuse you while editing). To see it, run:

```
npm run preview:pwa
```

then open `http://localhost:4173`. Chrome and Edge show an install icon at the right end of the address bar, and the app shows an "Install App" button in the header. The deployed GitHub Pages site behaves the same way.

## Academic calendar reminders

`src/utils/calendarReminders.ts` holds the reminder timing, the calendar (.ics) export and its alerts. Students choose the days before, the time of day and "important dates only" in Settings. Dates come from `src/data/academicCalendar.ts`.
