# Century Champions — roadmap

## Phase 0 — Discovery (1–2 weeks, partly in parallel with Phase 1 build)

- [ ] Collect ~5 sample packets; confirm serial format/length/charset (`docs/serial-spec.md`).
- [ ] Get printer make/model from Kujeradha; answer the barcode yes/no question
      (`docs/printer-barcode-audit.md`).
- [ ] Define the first 3 treasure chests with Century Steels (threshold + reward).
- [ ] Pick 2–3 hero products for the pilot.
- [ ] Export the existing serial list for the pilot batch (or generate the next batch in-app).

**Output:** serial spec + printer barcode yes/no + chest tier sheet.

## Phase 1 — MVP (this repo) ✅ built

Manual alphanumeric serial entry, no barcode.

- [x] Phone OTP login (dev OTP for now)
- [x] Contractor PWA: treasure-hunt home, fast multi-serial entry, chest-open celebration,
      rewards wallet, secondary journey log
- [x] Admin: products, serial CSV/paste/generate import, chest config, contractors,
      redemptions, coupon fulfilment, batch void
- [x] Core domain: atomic single-redemption, cumulative chest tiers, forward-looking progress
- [x] Anti-fraud: one-time serials, daily cap, unguessable codes, batch void

**Remaining to pilot:**

- [ ] Swap dev OTP for a real SMS gateway (MSG91 / Twilio) — `src/lib/otp.ts`
- [ ] Move DB to Supabase/Postgres and deploy to Vercel
- [ ] Replace shared admin password with staff accounts
- [ ] Pilot with 5–10 contractors in one Kerala town

**Success metrics:** 90%+ first-try verification, 6 serials entered in < 2 min, contractors
grasp "how much more to buy" without explanation, ≥1 chest opened during the pilot.

## Phase 2 — Barcode/QR scanner (2–3 weeks, after the factory decision)

- [ ] Camera scan fills the same serial field (single + rapid batch scan)
- [ ] Capacitor APK wrapper if browser camera UX is poor on low-end phones
- [ ] Malayalam / Tamil UI if needed

## Phase 3 — Ops & growth (3–4 weeks)

- [ ] Admin analytics: chest opens by region, top champions, product mix
- [ ] Coupon expiry + richer counter-redemption workflow
- [ ] WhatsApp / SMS nudges: "You're 3 packets away from your next chest!"
- [ ] Optional opt-in regional leaderboard

## Phase 4 — Scale (ongoing)

- [ ] Roll out to all Kerala/TN distributors
- [ ] Barcode across all product lines
- [ ] Distributor sub-accounts; optional invoice linking

## Deliberately NOT in v1

End-customer (homeowner) rewards · native iOS app · leaderboards · purchase-history-first
UI · barcode investment before the pilot proves adoption.
