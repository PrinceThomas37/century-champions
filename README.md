# Century Champions

Contractor rewards program for **Century Steels**. Contractors earn points for
completed work, climb loyalty tiers (Bronze → Silver → Gold → Platinum), and
redeem points for rewards.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and
**Tailwind CSS v4**.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Start the dev server (http://localhost:3000) |
| `npm run build`    | Production build                             |
| `npm start`        | Run the production build                     |
| `npm run lint`     | ESLint                                       |
| `npm run typecheck`| TypeScript type checking (`tsc --noEmit`)    |
| `npm test`         | Run the Vitest test suite                    |

## Architecture

Single Next.js app:

- **UI** (`src/app/page.tsx`) – client dashboard: leaderboard, award-points and
  enrollment forms, rewards catalog, redemptions feed.
- **API route handlers** (`src/app/api/*`) – `GET /api/state`,
  `POST /api/contractors`, `POST /api/points`, `POST /api/redeem`.
- **Data layer** (`src/lib/`) – `store.ts` persists to a local JSON file;
  `rewards-logic.ts` holds pure tier/redemption logic; `types.ts` the domain
  types.

### Data persistence

State is stored in a JSON file at `data/db.json` (override with `CC_DB_PATH`).
It is seeded automatically on first access and is git-ignored. This is suitable
for local development only; the filesystem is ephemeral in cloud deployments, so
a managed database should be used in production.
