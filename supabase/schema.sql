-- ============================================================
-- TAKUNDA - Supabase Schema
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor > New query
-- Execute each section in order (or run the full script)
-- ============================================================

-- Step 1: Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Step 2: Create tables (order matters for foreign keys)
-- ============================================================

-- Profiles: extends auth.users with app-specific fields
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  phone TEXT,
  school TEXT,
  major TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes: course catalog
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-Classes: many-to-many enrollment
CREATE TABLE IF NOT EXISTS public.user_classes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, class_id)
);

-- Decks: flashcard decks
CREATE TABLE IF NOT EXISTS public.decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cards: flashcards within a deck
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Step 3: Create profile on signup (trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Step 3b: Grant table permissions (authenticated role)
-- ============================================================

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.classes TO authenticated;
GRANT ALL ON public.user_classes TO authenticated;
GRANT ALL ON public.decks TO authenticated;
GRANT ALL ON public.cards TO authenticated;

-- ============================================================
-- Step 4: Enable Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_classes ENABLE ROW LEVEL SECURITY;
-- Decks & cards: RLS disabled for hackathon (simpler setup)
ALTER TABLE public.decks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Step 5: RLS Policies
-- ============================================================

-- Profiles: users can read any profile, update own
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Classes: readable by all (for now)
DROP POLICY IF EXISTS "Classes are viewable by everyone" ON public.classes;
CREATE POLICY "Classes are viewable by everyone" ON public.classes
  FOR SELECT USING (true);

-- User_classes: users can manage own enrollments
DROP POLICY IF EXISTS "Users can view user_classes" ON public.user_classes;
CREATE POLICY "Users can view user_classes" ON public.user_classes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own user_classes" ON public.user_classes;
CREATE POLICY "Users can insert own user_classes" ON public.user_classes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own user_classes" ON public.user_classes;
CREATE POLICY "Users can delete own user_classes" ON public.user_classes
  FOR DELETE USING (auth.uid() = user_id);

-- Decks & cards: RLS disabled for hackathon; policies skipped

-- ============================================================
-- Step 5b: Migration - add phone & onboarding_completed (if table exists)
-- Run this if you already have profiles table from a previous setup
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- ============================================================
-- Step 6: Seed sample classes (optional - comment out if re-running)
-- ============================================================

INSERT INTO public.classes (id, name, code) VALUES
  (uuid_generate_v4(), 'Introduction to Computer Science', 'CS 101'),
  (uuid_generate_v4(), 'Data Structures', 'CS 201'),
  (uuid_generate_v4(), 'Biology 101', 'BIO 101'),
  (uuid_generate_v4(), 'Calculus II', 'MATH 202');
