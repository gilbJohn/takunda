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

-- Friendships: bidirectional relationship (one row per pair)
CREATE TABLE IF NOT EXISTS public.friendships (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, friend_id),
  CHECK (user_id < friend_id)
);

-- Friend invites: from sender to recipient
CREATE TABLE IF NOT EXISTS public.friend_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, recipient_id)
);

-- Study groups: class_id NULL = general group (homework buddies)
CREATE TABLE IF NOT EXISTS public.study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study group members: many-to-many
CREATE TABLE IF NOT EXISTS public.study_group_members (
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Scheduled sessions: for calendar
CREATE TABLE IF NOT EXISTS public.study_group_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class join tokens: for shareable link + QR
CREATE TABLE IF NOT EXISTS public.class_join_tokens (
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (class_id)
);

-- Study group invites by email (MVP: store only)
CREATE TABLE IF NOT EXISTS public.study_group_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, email)
);

-- Study group invites by user (friend invited to join group)
CREATE TABLE IF NOT EXISTS public.study_group_user_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, recipient_id)
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
GRANT ALL ON public.friendships TO authenticated;
GRANT ALL ON public.friend_invites TO authenticated;
GRANT ALL ON public.study_groups TO authenticated;
GRANT ALL ON public.study_group_members TO authenticated;
GRANT ALL ON public.study_group_sessions TO authenticated;
GRANT ALL ON public.class_join_tokens TO authenticated;
GRANT ALL ON public.study_group_invites TO authenticated;
GRANT ALL ON public.study_group_user_invites TO authenticated;

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

-- Friendships: users can see own friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own friendships" ON public.friendships;
CREATE POLICY "Users can view own friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
DROP POLICY IF EXISTS "Users can insert friendship" ON public.friendships;
CREATE POLICY "Users can insert friendship" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);
DROP POLICY IF EXISTS "Users can delete own friendship" ON public.friendships;
CREATE POLICY "Users can delete own friendship" ON public.friendships
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Friend invites: sender and recipient can view
ALTER TABLE public.friend_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own invites" ON public.friend_invites;
CREATE POLICY "Users can view own invites" ON public.friend_invites
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
DROP POLICY IF EXISTS "Users can send invites" ON public.friend_invites;
CREATE POLICY "Users can send invites" ON public.friend_invites
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "Recipient can delete invite" ON public.friend_invites;
CREATE POLICY "Recipient can delete invite" ON public.friend_invites
  FOR DELETE USING (auth.uid() = recipient_id);

-- Study groups: viewable by members and for discovery
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Study groups viewable by all" ON public.study_groups;
CREATE POLICY "Study groups viewable by all" ON public.study_groups
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can create study groups" ON public.study_groups;
CREATE POLICY "Authenticated can create study groups" ON public.study_groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Study group members
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members viewable by all" ON public.study_group_members;
CREATE POLICY "Members viewable by all" ON public.study_group_members
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can join groups" ON public.study_group_members;
CREATE POLICY "Users can join groups" ON public.study_group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can leave groups" ON public.study_group_members;
CREATE POLICY "Users can leave groups" ON public.study_group_members
  FOR DELETE USING (auth.uid() = user_id);

-- Study group sessions
ALTER TABLE public.study_group_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Sessions viewable by all" ON public.study_group_sessions;
CREATE POLICY "Sessions viewable by all" ON public.study_group_sessions
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Members can create sessions" ON public.study_group_sessions;
CREATE POLICY "Members can create sessions" ON public.study_group_sessions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Class join tokens
ALTER TABLE public.class_join_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tokens viewable by class members" ON public.class_join_tokens;
CREATE POLICY "Tokens viewable by class members" ON public.class_join_tokens
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Class members can upsert tokens" ON public.class_join_tokens;
CREATE POLICY "Class members can upsert tokens" ON public.class_join_tokens
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Study group invites
ALTER TABLE public.study_group_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Invites viewable by group members" ON public.study_group_invites;
CREATE POLICY "Invites viewable by group members" ON public.study_group_invites
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Members can invite" ON public.study_group_invites;
CREATE POLICY "Members can invite" ON public.study_group_invites
  FOR INSERT WITH CHECK (auth.uid() = invited_by);

-- Study group user invites (friend invited to group)
ALTER TABLE public.study_group_user_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User invite viewable by sender or recipient" ON public.study_group_user_invites;
CREATE POLICY "User invite viewable by sender or recipient" ON public.study_group_user_invites
  FOR SELECT USING (auth.uid() = invited_by OR auth.uid() = recipient_id);
DROP POLICY IF EXISTS "Members can send user invites" ON public.study_group_user_invites;
CREATE POLICY "Members can send user invites" ON public.study_group_user_invites
  FOR INSERT WITH CHECK (auth.uid() = invited_by);
DROP POLICY IF EXISTS "Recipient can accept/decline user invite" ON public.study_group_user_invites;
CREATE POLICY "Recipient can accept/decline user invite" ON public.study_group_user_invites
  FOR DELETE USING (auth.uid() = recipient_id);

-- Classes: allow insert for MVP (users can create classes)
DROP POLICY IF EXISTS "Classes are viewable by everyone" ON public.classes;
CREATE POLICY "Classes are viewable by everyone" ON public.classes
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can create classes" ON public.classes;
CREATE POLICY "Authenticated can create classes" ON public.classes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- Step 5c: Auto-join class study group on user_classes insert
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_user_class_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  v_group_id UUID;
  v_class_name TEXT;
BEGIN
  -- Get class name for study group
  SELECT name INTO v_class_name FROM public.classes WHERE id = NEW.class_id;

  -- Find or create study group for this class
  SELECT id INTO v_group_id FROM public.study_groups WHERE class_id = NEW.class_id LIMIT 1;

  IF v_group_id IS NULL THEN
    INSERT INTO public.study_groups (name, class_id, created_by)
    VALUES (COALESCE(v_class_name, 'Study Group'), NEW.class_id, NEW.user_id)
    RETURNING id INTO v_group_id;
  END IF;

  -- Add user to study group if not already member
  INSERT INTO public.study_group_members (group_id, user_id)
  VALUES (v_group_id, NEW.user_id)
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_class_enrollment ON public.user_classes;
CREATE TRIGGER on_user_class_enrollment
  AFTER INSERT ON public.user_classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_class_enrollment();

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
