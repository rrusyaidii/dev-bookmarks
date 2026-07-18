# Dev Bookmarks — Project Context for Claude Code

## What is this?
A bookmark app for developers. Save dev resources (links, articles, tools, GitHub repos), AI auto-tags everything. Browse by tag, search, done.

## Stack
- Next.js 15 (App Router) — frontend + backend API routes
- TypeScript
- SQLite (via Prisma) — single file, zero setup
- Prisma ORM
- **No auth** — single-user app
- Tailwind CSS v4
- shadcn/ui components (Card, Button, Input, Badge, Dialog)
- OpenRouter (Gemini Flash) for AI tagging
- Vercel-ready / `next start` — no Docker

## Project Directory
```
dev-bookmarks/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── bookmarks/
│   │   │       ├── route.ts
│   │   │       └── [id]/route.ts
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── add/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── BookmarkCard.tsx
│   │   ├── TagFilter.tsx
│   │   ├── SearchBar.tsx
│   │   └── AddBookmarkForm.tsx
│   └── lib/
│       ├── prisma.ts
│       └── ai-tagger.ts
├── public/
└── .env.example
```

## Rules for Subagents
1. Each subagent owns its files — don't modify files outside your domain
2. Use TypeScript everywhere
3. Error handling on every API route
4. Consistent naming: camelCase for variables, kebab-case for files
5. All sensitive data via environment variables (check .env.example)
6. When done, report what files you created/changed

## Environment Variables
```
DATABASE_URL=file:./devmark.db
OPENROUTER_API_KEY=your-openrouter-key
```

## Design Constraints
- Dark mode default
- shadcn/ui components (Card, Button, Input, Badge, Dialog)
- Tailwind CSS v4
- Responsive layout
