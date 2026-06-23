## Cursor Cloud specific instructions

Single Next.js 16 (App Router) app — "Century Champions", a contractor rewards
dashboard. Standard commands live in `package.json` and `README.md`; key ones:
`npm run dev`, `npm run build`, `npm test`, `npm run lint`, `npm run typecheck`.

Non-obvious notes:

- **Data store**: state persists to a local JSON file at `data/db.json` (override
  via `CC_DB_PATH`). It is seeded on first access and git-ignored. To reset local
  state, delete `data/db.json`. Tests point `CC_DB_PATH` at a temp file, so they
  never touch the dev store.
- **Build warning**: `npm run build` prints an "unexpected file in NFT list"
  Node File Tracing warning because `src/lib/store.ts` reads the JSON file at
  runtime. The build still succeeds — this warning is expected and harmless for
  this file-based dev store.
- **Lint**: Next 16 enables `react-hooks/set-state-in-effect`. The mount-time
  data fetch in `src/app/page.tsx` has a single justified
  `eslint-disable-next-line` for it.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
