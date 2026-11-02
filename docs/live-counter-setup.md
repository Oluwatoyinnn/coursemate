# Live student counter: one-time setup (about 10 minutes, free)

The counter shows **"Students on Course Mate: N"** to everyone. Each device is counted once, using a
random anonymous ID saved on that device. No names, emails or course data are sent.

Until you finish these steps the counter simply stays hidden. The app never shows a made-up number.

## 1. Create the database (Supabase)

1. Go to [supabase.com](https://supabase.com), sign in, and click **New project** (the free plan is enough).
2. When the project is ready, open **SQL Editor → New query**, paste this, and click **Run**:

```sql
-- Safe to run more than once
create table if not exists public.students (
  id uuid primary key,
  created_at timestamptz not null default now()
);

alter table public.students enable row level security;

-- Anyone may register their own device, but nobody can read the list of IDs
drop policy if exists "register a device" on public.students;
create policy "register a device" on public.students
  for insert to anon with check (true);

grant usage on schema public to anon;
grant insert on public.students to anon;

-- Anyone may read only the total
create or replace function public.student_count()
returns bigint
language sql
security definer
set search_path = public
as $$ select count(*) from public.students $$;

grant execute on function public.student_count() to anon;
```

To check it worked, run `select public.student_count();` in the SQL editor. It should return a number (0 is fine)
and no error.

## 2. Copy two values

In Supabase open **Project Settings → API** and copy:

- **Project URL** (looks like `https://abcdxyz.supabase.co`). Do not add `/rest/v1/` to the end. The app now tolerates it, but keep it clean.
- **anon public key** (the long one labelled `anon` `public`)

The anon key is meant to be public. The rules above are what keep the data safe.

## 3. Give them to the app

**For GitHub deploys:** repo **Settings → Secrets and variables → Actions → New repository secret**.
Add two secrets with exactly these names:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | the Project URL |
| `VITE_SUPABASE_ANON_KEY` | the anon public key |

Then push any change (or re-run the deploy workflow). The workflow already passes them to the build.

**For running on your own computer:** create a file called `.env.local` next to `package.json`:

```
VITE_SUPABASE_URL=https://abcdxyz.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**For Pxxl, Vercel or Netlify:** add the same two names as environment variables in that site's settings, then redeploy.

## Good to know

- The starting number is the real number of devices that have opened the app since you finish this setup.
- Clearing browser data or using a private window counts as a new device. That is normal for any anonymous counter.
- To reset to zero before launch: in Supabase **Table Editor → students**, delete all rows.
