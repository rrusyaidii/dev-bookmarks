# Deploy DevMark (Supabase + Vercel)

Email/password auth only (no Google).

## 1. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New project (remember the DB password)
2. **Authentication → Providers → Email**
   - Enable Email
   - For easier local testing: turn **OFF** “Confirm email” (optional)
   - **Disable new sign-ups** after you create your own account (single-user lock)
3. Set `ALLOWED_EMAIL=your@email.com` in `.env` / Vercel (app rejects everyone else)
4. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (later change to Vercel URL)
   - Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://YOUR-APP.vercel.app/auth/callback` (after deploy)
5. **Project Settings → API** — copy into `.env`:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. **Project Settings → Database** — copy **Transaction** pooler URI (port `6543`) → `DATABASE_URL`
   - Append `?pgbouncer=true` if not present
   - Replace `[YOUR-PASSWORD]` with the DB password from step 1

Ignore Google provider entirely.

## 2. Local setup

```bash
# fill .env with the values from step 1 + OPENROUTER_API_KEY

npx prisma db push
npm run dev
```

Open `http://localhost:3000` → Register → Login.

**Migrate old SQLite bookmarks:** Tools → Export JSON (old app) → Import JSON (after login on new stack).

## 3. Deploy to Vercel

1. Import GitHub repo `rrusyaidii/dev-bookmarks` into Vercel
2. Add Environment Variables (Production + Preview):
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` = `https://YOUR-APP.vercel.app`
   - `OPENROUTER_API_KEY`
3. Deploy
4. Update Supabase Site URL + Redirect URLs with the real Vercel URL
5. Update `NEXT_PUBLIC_APP_URL` if needed, redeploy

## 4. Chrome extension (after deploy)

1. `chrome://extensions` → Load unpacked → `extension/`
2. Settings:
   - API base = your Vercel URL (or `http://localhost:3000`)
   - Supabase URL + anon key
3. Sign in (email/password) → Save bookmark

## 5. Verify

- [ ] Register / login with email
- [ ] Add bookmark while logged in
- [ ] Sign out → redirected to `/login`
- [ ] Extension save appears in web app
