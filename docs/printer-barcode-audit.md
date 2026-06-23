# Barcode / QR decision (Phase 2 — not blocking the MVP)

**Century Steels does not need barcodes to launch Century Champions.** Manual serial entry
works today. Barcodes are a UX upgrade that removes typing — decide on them *after* the
pilot proves contractors use the app.

## The decision your friend has to make

His existing packet printer prints an alphanumeric serial on each packet. The question is
whether that same printer can also output a scannable barcode/QR inline, or whether he'd
have to stick pre-printed labels.

### Option A — print the barcode on the existing printer

If the current printer supports barcode fonts or a barcode/QR module:

- Zero sticker labour; serial + barcode printed in one step at packing time.
- One-time cost: possible firmware update, barcode font licence, or a small software
  change — often ₹0–20,000.
- **Action:** note the exact printer **make/model** at the Kujeradha plant and check the
  manual / call the vendor: _"Can this printer output Code 128 or a QR code inline during
  our existing serial print step?"_

### Option B — pre-printed barcode stickers (~60,000)

If the printer cannot do barcodes:

- Buy thermal label rolls pre-printed with a unique QR/barcode + the human-readable serial.
- Rough cost: ₹0.50–2.00 per label × 60,000 ≈ **₹30,000–1,20,000** for the first run, plus
  the labour to apply each sticker.
- **Risk:** 60,000 manual sticks is slow and error-prone unless applied at the same packing
  station where serials are already printed.

### Option C — stay alphanumeric only (the MVP default)

- No factory investment. Contractors type ~6 codes per visit.
- Revisit barcodes only if the pilot shows contractors use the app but complain about typing.

## Recommendation

| Situation                                   | Best path                                                        |
| ------------------------------------------- | ---------------------------------------------------------------- |
| Printer supports barcode inline             | **Option A** — cheapest long-term                                |
| Printer can't; high ongoing volume          | Buy a barcode-capable thermal printer (~₹15,000–30,000) for the line |
| Printer can't; one-time ~60k pilot only     | **Option C** for now; stickers only if typing kills adoption     |

## Phase 0 deliverable

Just two facts, gathered in parallel with building the app:

1. Printer **make + model** from the Kujeradha plant.
2. Yes/no: can it print a barcode/QR inline?

This is a business decision for your friend — **it does not block the app.** When the answer
lands, Phase 2 adds a camera scanner to `src/app/champion/scan/page.tsx` that fills the same
serial field the contractor types into today.
