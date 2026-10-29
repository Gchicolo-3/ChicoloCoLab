# CoLab Intake

Hosted client intake form for Chicolo CoLab. Clients answer one question per screen on their phone, answers save to Supabase as they go, George gets an SMS when they submit, and George reads responses on a private admin page.

This app lives entirely in `/intake` and is separate from the static CoLab site at the repo root.

## Stack

Next.js (App Router, TypeScript), Supabase (Postgres plus Auth), Twilio SMS, Vercel.

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
| TWILIO_ACCOUNT_SID | Twilio account |
| TWILIO_AUTH_TOKEN | Twilio auth |
| TWILIO_FROM_NUMBER | Twilio sending number |
| NOTIFY_PHONE | Number that gets the "finished their intake" text |
| ADMIN_EMAIL | The only email allowed into /admin |

## Deploy

Separate Vercel project `colab-intake`, Root Directory set to `intake`.
