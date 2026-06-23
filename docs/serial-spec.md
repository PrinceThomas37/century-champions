# Serial code specification

The serial code is the heart of Phase 1: one printed code = one packet = one redemption.

## Current format (system-generated)

When the system generates codes (admin → Serials → "generate"), they look like:

```
RVT-48TV-3C3N
```

- Three groups separated by hyphens: `PREFIX-XXXX-XXXX`.
- **Prefix** (up to 3 chars) is derived from the batch code, so codes are visually
  traceable to a batch (e.g. `RVT` for a rivet batch).
- **Alphabet:** `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` — deliberately **excludes the
  ambiguous characters** `0`, `O`, `1`, and `I` to cut down on contractor typing errors.
- 8 random characters → ~32^8 ≈ 1.1 trillion combinations per prefix, so codes are not
  practically guessable.

## Accepting the factory's existing format

Century Steels already prints a unique alphanumeric serial on each packet. You do **not**
have to adopt the generated format — paste the factory's existing serial list into
admin → Serials instead. Input is normalised before matching:

- Trimmed and upper-cased.
- Whitespace removed.
- Characters outside `A–Z`, `0–9`, and `-` stripped.

This means a contractor typing `rvt 48tv 3c3n` or `RVT-48TV-3C3N` both match.

## Action item for Phase 0

Collect ~5 sample packets and confirm:

- [ ] Exact character set the factory printer uses (does it include `0/O/1/I`? if so we
      keep input strict rather than folding).
- [ ] Length and grouping (so we can show a matching input mask / placeholder).
- [ ] Whether serials are guaranteed unique across all batches (they must be — the system
      enforces global uniqueness on import and skips any duplicate).

Once confirmed, update the input placeholder/validation in
`src/app/champion/scan/page.tsx` and the normaliser in `src/lib/champions.ts`
(`normalizeSerial`) if needed.
