# Dev Bookmarks — Project Context for Claude Code

## What is this?
A bookmark app for developers. Save dev resources (links, articles, tools, GitHub repos), AI auto-tags everything. Browse by tag, search, done.

## Stack
- Next.js (App Router) — frontend + backend API routes
- TypeScript
- Supabase Postgres (via Prisma)
- Supabase Auth (email/password + Google)
- Tailwind CSS v4
- OpenRouter (Gemini Flash) for AI tagging
- Deploy: Vercel

## Project Directory
```
dev-bookmarks/
├── prisma/schema.prisma
├── extension/                 # Chrome MV3 saver
├── DEPLOY.md                  # Supabase + Vercel setup
├── src/
│   ├── app/
│   │   ├── (auth)/login|register
│   │   ├── (dashboard)/...
│   │   ├── api/bookmarks|tags
│   │   └── auth/callback
│   ├── components/
│   ├── lib/                   # prisma, auth, supabase, ai-tagger
│   └── middleware.ts
└── .env.example
```

## Environment Variables
See `.env.example` and `DEPLOY.md`.

## Design Constraints
- Dark mode default
- Responsive layout
- All bookmarks scoped by `userId` (Supabase auth user id)
