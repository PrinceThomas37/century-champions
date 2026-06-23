# Century Champions

A contractor rewards **treasure-hunt** platform for **Century Steels** (rivets, bolts,
false-ceiling connectors). Contractors enter the serial code printed on each packet they
buy; every valid code moves them closer to opening their next **treasure chest** and
claiming a reward. The whole experience is forward-looking — the hero message is always
_"X more to open your next chest,"_ never a list of past purchases.

This repo is the **Phase 1 MVP**: manual alphanumeric serial entry, no barcode/QR yet.

---

## What's inside

A single Next.js app serves both faces of the product:

| Path          | Who          | What                                                                 |
| ------------- | ------------ | ------------------------------------------------------------------- |
| `/champion`   | Contractors  | The PWA: treasure-hunt home, fast multi-serial entry, rewards wallet |
| `/admin`      | Century staff | Products, serial import, chest milestones, contractors, redemptions  |

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Prisma ORM · SQLite (dev).
Designed to move to Supabase/Postgres + hosting on Vercel with minimal change (see below).

---

## Quick start (local)

```bash
# 1. Install dependencies
npm install

# 2. Create your env file
cp .env.example .env

# 3. Create the database and load sample data
npm run db:push
npm run db:seed

# 4. Run it
npm run dev
```

Then open:

- Contractor app → http://localhost:3000/champion
- Admin dashboard → http://localhost:3000/admin

### Demo credentials

- **Contractor login:** any 10-digit mobile (e.g. `9999999999`). In dev mode the OTP is
  not sent by SMS — the fixed code **`123456`** works and is also shown on screen.
- **Admin password:** `century-admin` (set by `ADMIN_PASSWORD` in `.env`).

The seed prints a handful of sample serial codes you can type into the contractor app to
watch progress climb and a chest open.

> **Note on Prisma engines:** if `npm install`'s automatic engine download is blocked by
> your network, the engines can be fetched manually with `curl` — see
> [`docs/prisma-engines.md`](docs/prisma-engines.md).

---

## How the treasure hunt works

1. A contractor buys ~6 packets of Century Steel product.
2. They open the app and type the serial code printed on each packet (one at a time —
   instant feedback, the field auto-clears for the next code).
3. Each valid code is redeemed exactly once and adds **points** (default 1 point/packet;
   premium products can be worth more).
4. Their progress bar fills toward the **next treasure chest**. The screen only ever shows
   _how much more_ they need — not what they've already bought.
5. When lifetime points cross a chest threshold, the chest **opens** with a celebration and
   issues a **coupon code**. They show that code at the Century counter to claim the reward.
6. Staff mark coupons claimed in the admin dashboard.

Chests are **cumulative lifetime tiers** (Bronze → Silver → Gold …), so champions keep
climbing. Thresholds and rewards are fully configurable in admin without code changes.

---

## Admin workflow

1. **Products** — add each SKU and its points-per-packet.
2. **Serials** — import a batch per product. Either paste the factory's serial list (one
   per line) or have the system generate unique, unambiguous codes (no `0/O/1/I`) you can
   export and print.
3. **Treasure Chests** — define milestones (threshold in points + the reward inside).
4. **Champions / Redemptions** — watch contractors climb, and fulfil coupons at the counter.

If a serial list ever leaks, **void the batch** to invalidate its unused codes.

---

## Anti-fraud (MVP)

- Each serial is redeemable exactly once (atomic claim guards against double-submit races).
- Per-contractor daily redemption cap (covers large purchases, blocks abuse).
- Generated serials use a non-guessable, unambiguous alphabet.
- Admin can void a whole batch.

---

## Deploying / going to production

The app is wired for **Supabase Postgres + Vercel**. A dedicated Supabase project is already
provisioned and seeded — follow **[`docs/deploy.md`](docs/deploy.md)** to connect the
connection string and ship it to a public URL.

Remaining hardening, all incremental:

1. **Real OTP:** wire an SMS gateway (MSG91 / Twilio) in `src/lib/otp.ts` and set
   `DEV_OTP_MODE=false`.
2. **Admin accounts:** replace the shared admin password with proper staff logins.
3. **Phase 2 — barcode/QR scan:** add a camera scanner to the entry screen once Century
   Steels decides on inline-printed barcodes vs. stickers
   (see [`docs/printer-barcode-audit.md`](docs/printer-barcode-audit.md)).

See [`docs/roadmap.md`](docs/roadmap.md) for the full phased plan.

---

## Project layout

```
century-champions/
├── prisma/
│   ├── schema.prisma        # data model (Products, Serials, Contractors, Chests …)
│   └── seed.ts              # sample products, serials, chests, demo contractor
├── src/
│   ├── app/
│   │   ├── champion/        # contractor PWA (home, login, scan, wallet, journey)
│   │   ├── admin/           # staff dashboard + server actions
│   │   └── api/             # auth, redeem, progress endpoints
│   ├── components/          # TreasureChest, ProgressBar, nav, AdminShell
│   └── lib/                 # db, auth, otp, champions (core domain logic)
├── public/                  # PWA manifest + icon
└── docs/                    # serial spec, barcode audit, roadmap, engine notes
```

The core reward logic lives in [`src/lib/champions.ts`](src/lib/champions.ts):
serial redemption, chest opening, and the forward-looking progress calculation.
