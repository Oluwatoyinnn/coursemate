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
- **My Schedule.** Add personal events (study, meetings) next to your lectures. Clash warnings included.
- **Reminders.** Optional class alerts and alarm sounds.
- **Extras.** CGPA goal calculator, academic calendar, share and print your timetable.
- **Day and dark modes**, plus colour themes.
- **Works offline.** Installable as an app (PWA). Your data stays on your device: no login, no account.

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
    storage.ts               Saves your profile and events on-device
public/                    App icons, favicon, manifest, sponsor images
vite.config.ts             Build config and PWA manifest (name, colours, icons)
```

---

## Updating the timetable (e.g. a new TIMTEC version)

1. Edit or replace the sessions in `src/data/timetableData.json` and `src/data/timetable.ts`.
2. Update the version number in `OFFICIAL_METADATA` (top of `timetable.ts`) so the header shows the right one.
3. Run `npm run lint`, then `npm run dev` and spot-check a few courses against the PDF.

---

## Deploying

This repo includes a GitHub Pages workflow (`.github/workflows/deploy.yml`).

1. Push to GitHub on the `main` branch.
2. In the repo go to **Settings → Pages → Source** and choose **GitHub Actions**.
3. Every push to `main` rebuilds and publishes the site automatically.

It also deploys without changes to Vercel or Netlify (build command `npm run build`, output folder `dist`).

---

## Notes

- The Empty Venue Finder only knows the lecture timetable. "Free" means *no timetabled class*, not a guaranteed free room. Exams and events are not included.
- Student data (name, courses, events, settings) is stored only in the browser on the user's own device.

---

## Credits

Designed and developed by **Sisco Ask** · [siscoask.vercel.app](https://siscoask.vercel.app)

Timetable data © Federal University of Agriculture, Abeokuta (TIMTEC). This app is an independent student utility.