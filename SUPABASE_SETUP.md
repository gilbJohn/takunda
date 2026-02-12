# Supabase Setup Guide

## 1. Add credentials to `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

Or use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` if that's what your Supabase project uses.

**Document import:** `GEMINI_API_KEY` is required for the "Import from document" feature on the Create deck page (PDF, DOCX, PPTX). Get a key at [Google AI Studio](https://aistudio.google.com/apikey).

## 2. Enable Email Auth in Supabase

1. Go to **Authentication** → **Providers**
2. Enable **Email**
3. (Optional) Disable email confirmation for faster development

## 3. Run the schema in Supabase SQL Editor

1. Go to your Supabase project → **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and click **Run**

The schema creates:

- `profiles` – user profiles (linked to auth.users) with `phone` and `onboarding_completed`
- `classes` – course catalog
- `user_classes` – user enrollments (many-to-many)
- `decks` – flashcard decks
- `cards` – flashcards
- Triggers to create a profile on signup
- Row Level Security (RLS) policies

## 4. Restart the dev server

```bash
npm run dev
```

## 5. Test

1. Sign up with a new email/password
2. Create a deck
3. Search for users in Find (after adding class enrollments)

## Troubleshooting

- **"relation does not exist"** – Run the full schema SQL
- **RLS errors** – Ensure policies were created (Step 5 in schema)
- **403 "new row violates row-level security policy" on decks** – Usually means `auth.uid()` is null (no session sent). The Supabase client is now browser-only. If it still fails: (a) Re-run the schema SQL to add `GRANT ALL` on tables for the `authenticated` role, or (b) In Supabase SQL Editor run: `GRANT ALL ON public.decks TO authenticated;`
- **Profile not found after signup** – The trigger may need a moment; the app retries after 500ms
- **"Not authenticated" or can't create decks** – Your previous account was from mock mode (before Supabase). Use **Sign up** (not Log in) to create a new Supabase account. The app will now clear stale sessions automatically.

- **"Invalid email or password" on login** – If you only had a mock account, it doesn't exist in Supabase. Use **Sign up** to create a real account first.

- **"Email not confirmed" or 400 on login** – Supabase may require email confirmation. Either: (a) Check your inbox for the confirmation link and click it, or (b) In Supabase Dashboard → Authentication → Providers → Email → disable "Confirm email" for faster development.
