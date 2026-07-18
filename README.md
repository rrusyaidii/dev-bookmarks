# DevMark

Personal bookmark manager for developers. Save links, AI auto-tags them, browse by tag, search, export/import.

**Live:** [https://dev-bookmarks-eight.vercel.app](https://dev-bookmarks-eight.vercel.app)

## Stack

- Next.js (App Router) + TypeScript
- Supabase Auth (email/password) + Postgres
- Prisma ORM
- OpenRouter (AI tagging)
- Tailwind CSS v4
- Deployed on Vercel

Single-user by design: set `ALLOWED_EMAIL` and disable new sign-ups in Supabase.

## Features

- Add bookmarks with auto metadata + AI tags
- Dashboard, search, tag filters, favorites, notes
- Edit / delete / retag
- Tools: export/import JSON, retag all, check dead links
- Private login (owner email only)

## Local setup

1. Copy env:
   ```bash
   cp .env.example .env
   ```
2. Fill values (see `.env.example`):
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ALLOWED_EMAIL`
   - `OPENROUTER_API_KEY`
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
3. Push schema + run:
   ```bash
   npx prisma db push
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) → login with your allowed email.

## Deploy (Vercel)

1. Import the GitHub repo into Vercel
2. Add the same env vars (Production + Preview)
3. Set `NEXT_PUBLIC_APP_URL=https://dev-bookmarks-eight.vercel.app`
4. In Supabase Auth → URL Configuration:
   - Site URL: `https://dev-bookmarks-eight.vercel.app`
   - Redirect: `https://dev-bookmarks-eight.vercel.app/auth/callback`

## Scripts

```bash
npm run dev      # local
npm run build    # prisma generate + next build
npm run start    # production server
npm run lint
```

## License

Private project.
