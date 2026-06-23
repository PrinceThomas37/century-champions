# Deploying Century Champions

Plain-English version: **Supabase** is the cloud database (remembers everything),
**Vercel** is the hosting that gives you a public link. The database is already set up;
this guide covers connecting the app to it and putting it on Vercel.

## What's already done

- ✅ A dedicated Supabase project **`century-champions`** (Mumbai region) — separate from any
  other database.
- ✅ All tables created and seeded with sample products, the 3 treasure chests, a demo
  contractor, and 75 test serial codes.
- ✅ The app code is configured for Supabase Postgres + Vercel.

## Step 1 — Get your database connection string (one-time, ~2 min)

The database password is set but secret. Reset it once so you can copy it:

1. Open the Supabase dashboard → project **century-champions**.
2. **Project Settings → Database → Reset database password** → copy the new password.
3. Your two connection strings are (paste the password where shown):

   **DATABASE_URL** (pooled — what the app uses):
   ```
   postgresql://postgres.ryvxgpyxevjzkjfteghg:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```

   **DIRECT_URL** (direct — for migrations):
   ```
   postgresql://postgres.ryvxgpyxevjzkjfteghg:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
   ```

## Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the GitHub repo
   `PrinceThomas37/century-champions`.
2. Vercel auto-detects Next.js — no build settings to change.
3. Add these **Environment Variables** (Settings → Environment Variables):

   | Name            | Value                                                        |
   | --------------- | ------------------------------------------------------------ |
   | `DATABASE_URL`  | the pooled string from Step 1                                |
   | `DIRECT_URL`    | the direct string from Step 1                                |
   | `SESSION_SECRET`| any long random string (e.g. a password generator, 32+ chars)|
   | `ADMIN_PASSWORD`| the admin dashboard password you want                        |
   | `DEV_OTP_MODE`  | `true` (keep until real SMS is wired — see below)            |
   | `DEV_OTP_CODE`  | `123456` (the login code while in dev OTP mode)              |

4. Click **Deploy**. In ~2 minutes you get a URL like `century-champions.vercel.app`.

Open `your-url/champion` for the contractor app and `your-url/admin` for the dashboard.

## Step 3 — Try it

- Contractor: open `/champion`, log in with any 10-digit number, code `123456`, then enter
  a sample serial code (ask the developer for the seeded codes, or import your own under
  admin → Serials).
- Admin: open `/admin`, password = your `ADMIN_PASSWORD`.

## Later: real SMS login

While `DEV_OTP_MODE=true`, anyone logs in with the code `123456` — fine for testing, not for
real contractors. To send real codes, wire an SMS gateway (MSG91 or Twilio) in
`src/lib/otp.ts`, add its API key as an env var, and set `DEV_OTP_MODE=false`.

## Notes

- The free Supabase tier pauses a project after ~1 week of zero activity; it auto-resumes on
  the next request (first request may be slow). A pilot with active contractors won't hit this.
- To change schema later: edit `prisma/schema.prisma`, run `npx prisma migrate dev` locally
  against `DIRECT_URL`, and redeploy.
