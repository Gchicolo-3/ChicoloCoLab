# CoLab Intake

Hosted client intake form for Chicolo CoLab. Clients answer one question per screen on their phone, answers save to Supabase as they go, George gets an email when they submit, and George reads responses on a private admin page.

This app lives entirely in `/intake` and is separate from the static CoLab site at the repo root.

## Stack

Next.js (App Router, TypeScript), Supabase (Postgres plus Auth), Resend email, Vercel.

## Where the data lives

For now the tables live inside the existing focusedoutreach Supabase project, all prefixed `intake_` so they stay separate from everything else there:

- `intake_clients` and `intake_responses`, plus the function `intake_save_answer`.
- Row Level Security is on for both tables with no policies, and the anon and authenticated roles have no privileges. Everything goes through server routes with the service role key.
- To remove or move it later: `drop table public.intake_responses, public.intake_clients; drop function public.intake_save_answer(uuid, text, jsonb, int);`

Migrations are in `supabase/migrations`. Do not edit one after it has been applied.

## Local setup

```
cd intake
cp .env.example .env.local   # fill in values, never commit
npm install
npm run dev
```

## Environment variables

| Name | Used for |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key (admin magic link login only) |
| SUPABASE_SERVICE_ROLE_KEY | Server routes only, never sent to the browser |
| RESEND_API_KEY | Sends the "finished their intake" email |
| NOTIFY_EMAIL | Inbox that gets that email |
| ADMIN_EMAIL | The only email allowed into /admin |

The email is sent from `onboarding@resend.dev`, one per response, on first submit only. If it fails, the failure is logged and the response is still marked submitted.

Admin login uses a Supabase magic link. The deployed site URL (and any preview URL you want to log in from) must be listed under Authentication, URL Configuration, Redirect URLs in the Supabase project as `<site url>/auth/callback`.

## Local testing without Supabase

With `INTAKE_STORE=memory` in a non production run, a throwaway in memory store is used and the admin login sets a plain cookie instead of sending a link. It refuses to run when `NODE_ENV` is production.

## Deploy

Separate Vercel project `colab-intake`, Root Directory set to `intake`. The repo root has a `.vercelignore` so the static CoLab site project does not pick up this folder.
