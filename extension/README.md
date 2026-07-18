# DevMark Chrome Extension

One-click save the current tab into DevMark (local or Vercel).

## Setup

1. Deploy DevMark (or run `npm run dev` locally)
2. Open Chrome → `chrome://extensions`
3. Enable **Developer mode**
4. **Load unpacked** → select this `extension/` folder
5. Open **Settings** on the extension:
   - **API base URL** — `http://localhost:3000` or your Vercel URL
   - **Supabase project URL** — from Supabase → Project Settings → API
   - **Supabase anon key** — same page
6. Click the extension icon → sign in with email/password → **Save bookmark**

## Google login

Use the web app (`/login` → Continue with Google), then use email/password in the extension, or open the web login link from the popup.

## Notes

- App must be reachable at the API base URL
- Extension sends `Authorization: Bearer <access_token>` to the API
