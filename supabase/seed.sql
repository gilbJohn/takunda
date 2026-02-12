-- ============================================================
-- TAKUNDA - Fake Seed Data
-- Run AFTER schema.sql.
--   Local:  supabase db reset  (runs schema + seed)
--   Hosted: Run schema.sql, then paste this in SQL Editor
-- All user passwords: password123
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. Seed Users (auth.users + auth.identities)
-- Trigger will create profiles; we'll update them with details
-- ============================================================

DO $$
DECLARE
  inst_id UUID;
  u1 UUID := 'a1111111-1111-4111-8111-111111111101';
  u2 UUID := 'a1111111-1111-4111-8111-111111111102';
  u3 UUID := 'a1111111-1111-4111-8111-111111111103';
  u4 UUID := 'a1111111-1111-4111-8111-111111111104';
  u5 UUID := 'a1111111-1111-4111-8111-111111111105';
  u6 UUID := 'a1111111-1111-4111-8111-111111111106';
  u7 UUID := 'a1111111-1111-4111-8111-111111111107';
  pw TEXT := crypt('password123', gen_salt('bf'));
BEGIN
  SELECT COALESCE((SELECT id FROM auth.instances LIMIT 1), '00000000-0000-0000-0000-000000000000'::UUID) INTO inst_id;

  -- Alex Chen
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (u1, inst_id, 'authenticated', 'authenticated', 'alex.chen@university.edu', pw, NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Alex Chen"}', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (u1, u1, format('{"sub":"%s","email":"alex.chen@university.edu"}', u1)::jsonb, 'email', u1::text, NOW(), NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Jordan Taylor
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (u2, inst_id, 'authenticated', 'authenticated', 'jordan.taylor@university.edu', pw, NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Jordan Taylor"}', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (u2, u2, format('{"sub":"%s","email":"jordan.taylor@university.edu"}', u2)::jsonb, 'email', u2::text, NOW(), NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Sam Rivera
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (u3, inst_id, 'authenticated', 'authenticated', 'sam.rivera@university.edu', pw, NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Sam Rivera"}', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (u3, u3, format('{"sub":"%s","email":"sam.rivera@university.edu"}', u3)::jsonb, 'email', u3::text, NOW(), NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Morgan Kim
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (u4, inst_id, 'authenticated', 'authenticated', 'morgan.kim@university.edu', pw, NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Morgan Kim"}', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (u4, u4, format('{"sub":"%s","email":"morgan.kim@university.edu"}', u4)::jsonb, 'email', u4::text, NOW(), NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Casey Nguyen
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (u5, inst_id, 'authenticated', 'authenticated', 'casey.nguyen@university.edu', pw, NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Casey Nguyen"}', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (u5, u5, format('{"sub":"%s","email":"casey.nguyen@university.edu"}', u5)::jsonb, 'email', u5::text, NOW(), NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Riley Patel
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (u6, inst_id, 'authenticated', 'authenticated', 'riley.patel@university.edu', pw, NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Riley Patel"}', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (u6, u6, format('{"sub":"%s","email":"riley.patel@university.edu"}', u6)::jsonb, 'email', u6::text, NOW(), NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Drew Foster
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (u7, inst_id, 'authenticated', 'authenticated', 'drew.foster@university.edu', pw, NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Drew Foster"}', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (u7, u7, format('{"sub":"%s","email":"drew.foster@university.edu"}', u7)::jsonb, 'email', u7::text, NOW(), NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ============================================================
-- 2. Update profiles with school, major, onboarding
-- ============================================================

UPDATE public.profiles SET school = 'State University', major = 'Computer Science', onboarding_completed = true WHERE id = 'a1111111-1111-4111-8111-111111111101';
UPDATE public.profiles SET school = 'State University', major = 'Computer Science', onboarding_completed = true WHERE id = 'a1111111-1111-4111-8111-111111111102';
UPDATE public.profiles SET school = 'State University', major = 'Biology', onboarding_completed = true WHERE id = 'a1111111-1111-4111-8111-111111111103';
UPDATE public.profiles SET school = 'State University', major = 'Mathematics', onboarding_completed = true WHERE id = 'a1111111-1111-4111-8111-111111111104';
UPDATE public.profiles SET school = 'State University', major = 'Computer Science', onboarding_completed = true WHERE id = 'a1111111-1111-4111-8111-111111111105';
UPDATE public.profiles SET school = 'State University', major = 'Biology', onboarding_completed = true WHERE id = 'a1111111-1111-4111-8111-111111111106';
UPDATE public.profiles SET school = 'State University', major = 'Engineering', onboarding_completed = true WHERE id = 'a1111111-1111-4111-8111-111111111107';

-- ============================================================
-- 3. Enroll users in classes (requires classes from schema)
-- ============================================================

INSERT INTO public.user_classes (user_id, class_id) VALUES
  ('a1111111-1111-4111-8111-111111111101', (SELECT id FROM public.classes WHERE code = 'CS 101' LIMIT 1)),
  ('a1111111-1111-4111-8111-111111111101', (SELECT id FROM public.classes WHERE code = 'CS 201' LIMIT 1)),
  ('a1111111-1111-4111-8111-111111111102', (SELECT id FROM public.classes WHERE code = 'CS 101' LIMIT 1)),
  ('a1111111-1111-4111-8111-111111111102', (SELECT id FROM public.classes WHERE code = 'MATH 202' LIMIT 1)),
  ('a1111111-1111-4111-8111-111111111103', (SELECT id FROM public.classes WHERE code = 'BIO 101' LIMIT 1)),
  ('a1111111-1111-4111-8111-111111111103', (SELECT id FROM public.classes WHERE code = 'MATH 202' LIMIT 1)),
  ('a1111111-1111-4111-8111-111111111104', (SELECT id FROM public.classes WHERE code = 'MATH 202' LIMIT 1)),
  ('a1111111-1111-4111-8111-111111111104', (SELECT id FROM public.classes WHERE code = 'CS 101' LIMIT 1)),
  ('a1111111-1111-4111-8111-111111111105', (SELECT id FROM public.classes WHERE code = 'CS 201' LIMIT 1)),
  ('a1111111-1111-4111-8111-111111111105', (SELECT id FROM public.classes WHERE code = 'BIO 101' LIMIT 1)),
  ('a1111111-1111-4111-8111-111111111106', (SELECT id FROM public.classes WHERE code = 'BIO 101' LIMIT 1)),
  ('a1111111-1111-4111-8111-111111111107', (SELECT id FROM public.classes WHERE code = 'CS 101' LIMIT 1)),
  ('a1111111-1111-4111-8111-111111111107', (SELECT id FROM public.classes WHERE code = 'MATH 202' LIMIT 1))
ON CONFLICT (user_id, class_id) DO NOTHING;

-- ============================================================
-- 4. Decks & Cards (flashcards)
-- ============================================================

INSERT INTO public.decks (id, user_id, title) VALUES
  (uuid_generate_v4(), 'a1111111-1111-4111-8111-111111111101', 'CS 101 - Midterm Review'),
  (uuid_generate_v4(), 'a1111111-1111-4111-8111-111111111101', 'CS 201 - Binary Trees'),
  (uuid_generate_v4(), 'a1111111-1111-4111-8111-111111111102', 'MATH 202 - Integration Rules'),
  (uuid_generate_v4(), 'a1111111-1111-4111-8111-111111111102', 'CS 101 - Variables & Types'),
  (uuid_generate_v4(), 'a1111111-1111-4111-8111-111111111103', 'BIO 101 - Cell Structure'),
  (uuid_generate_v4(), 'a1111111-1111-4111-8111-111111111103', 'MATH 202 - Series & Sequences'),
  (uuid_generate_v4(), 'a1111111-1111-4111-8111-111111111104', 'Calculus Derivatives'),
  (uuid_generate_v4(), 'a1111111-1111-4111-8111-111111111105', 'Data Structures - Big O'),
  (uuid_generate_v4(), 'a1111111-1111-4111-8111-111111111106', 'BIO 101 - Genetics Basics'),
  (uuid_generate_v4(), 'a1111111-1111-4111-8111-111111111107', 'CS 101 - Control Flow');

-- Cards for "CS 101 - Midterm Review" (first deck for Alex)
INSERT INTO public.cards (deck_id, front, back)
SELECT d.id, c.front, c.back FROM public.decks d
CROSS JOIN (VALUES
  ('What is a variable?', 'A named storage location that holds a value'),
  ('What is the difference between let and const?', 'let can be reassigned; const cannot'),
  ('What does console.log do?', 'Prints output to the browser/Node console'),
  ('What is an array?', 'An ordered collection of elements, indexed by position'),
  ('What is a function?', 'A reusable block of code that performs a task'),
  ('What is a loop?', 'A control structure that repeats code until a condition is met')
) AS c(front, back)
WHERE d.user_id = 'a1111111-1111-4111-8111-111111111101' AND d.title = 'CS 101 - Midterm Review' LIMIT 1;

-- Cards for "CS 201 - Binary Trees"
INSERT INTO public.cards (deck_id, front, back)
SELECT d.id, c.front, c.back FROM public.decks d
CROSS JOIN (VALUES
  ('What is a binary tree?', 'A tree where each node has at most 2 children'),
  ('What is the height of a tree?', 'The longest path from root to a leaf'),
  ('What is a BST?', 'Binary Search Tree - left < parent < right'),
  ('Time complexity of BST search?', 'O(log n) average, O(n) worst'),
  ('What is tree traversal?', 'Visiting each node once (in-order, pre-order, post-order)')
) AS c(front, back)
WHERE d.user_id = 'a1111111-1111-4111-8111-111111111101' AND d.title = 'CS 201 - Binary Trees' LIMIT 1;

-- Cards for "MATH 202 - Integration Rules"
INSERT INTO public.cards (deck_id, front, back)
SELECT d.id, c.front, c.back FROM public.decks d
CROSS JOIN (VALUES
  ('∫ x^n dx = ?', 'x^(n+1)/(n+1) + C (when n ≠ -1)'),
  ('∫ 1/x dx = ?', 'ln|x| + C'),
  ('∫ e^x dx = ?', 'e^x + C'),
  ('∫ sin(x) dx = ?', '-cos(x) + C'),
  ('∫ cos(x) dx = ?', 'sin(x) + C')
) AS c(front, back)
WHERE d.user_id = 'a1111111-1111-4111-8111-111111111102' AND d.title = 'MATH 202 - Integration Rules' LIMIT 1;

-- Cards for "BIO 101 - Cell Structure"
INSERT INTO public.cards (deck_id, front, back)
SELECT d.id, c.front, c.back FROM public.decks d
CROSS JOIN (VALUES
  ('What is the powerhouse of the cell?', 'Mitochondria'),
  ('What does the nucleus contain?', 'DNA / genetic material'),
  ('What is the function of ribosomes?', 'Protein synthesis'),
  ('What organelle does photosynthesis?', 'Chloroplasts (in plant cells)'),
  ('What is the cell membrane made of?', 'Phospholipid bilayer')
) AS c(front, back)
WHERE d.user_id = 'a1111111-1111-4111-8111-111111111103' AND d.title = 'BIO 101 - Cell Structure' LIMIT 1;

-- ============================================================
-- 5. Friendships (user_id < friend_id - one row per pair)
-- ============================================================

INSERT INTO public.friendships (user_id, friend_id) VALUES
  ('a1111111-1111-4111-8111-111111111101', 'a1111111-1111-4111-8111-111111111102'), -- Alex & Jordan
  ('a1111111-1111-4111-8111-111111111101', 'a1111111-1111-4111-8111-111111111103'), -- Alex & Sam
  ('a1111111-1111-4111-8111-111111111101', 'a1111111-1111-4111-8111-111111111105'), -- Alex & Casey
  ('a1111111-1111-4111-8111-111111111102', 'a1111111-1111-4111-8111-111111111104'), -- Jordan & Morgan
  ('a1111111-1111-4111-8111-111111111102', 'a1111111-1111-4111-8111-111111111107'), -- Jordan & Drew
  ('a1111111-1111-4111-8111-111111111103', 'a1111111-1111-4111-8111-111111111106'), -- Sam & Riley
  ('a1111111-1111-4111-8111-111111111103', 'a1111111-1111-4111-8111-111111111104'), -- Sam & Morgan
  ('a1111111-1111-4111-8111-111111111104', 'a1111111-1111-4111-8111-111111111105'), -- Morgan & Casey
  ('a1111111-1111-4111-8111-111111111105', 'a1111111-1111-4111-8111-111111111106'), -- Casey & Riley
  ('a1111111-1111-4111-8111-111111111106', 'a1111111-1111-4111-8111-111111111107')  -- Riley & Drew
ON CONFLICT (user_id, friend_id) DO NOTHING;

-- ============================================================
-- 6. Friend invites (pending - Drew invited Alex)
-- ============================================================

INSERT INTO public.friend_invites (sender_id, recipient_id) VALUES
  ('a1111111-1111-4111-8111-111111111107', 'a1111111-1111-4111-8111-111111111101')
ON CONFLICT (sender_id, recipient_id) DO NOTHING;

-- ============================================================
-- 7. Study groups (class-based groups come from user_classes trigger)
--    Add two general groups: Homework Buddies, Late Night Crammers
-- ============================================================

-- Create general "Homework Buddies" group (class_id = NULL)
INSERT INTO public.study_groups (name, class_id, created_by) VALUES
  ('Homework Buddies', NULL, 'a1111111-1111-4111-8111-111111111102');

-- Get IDs for adding members
DO $$
DECLARE
  cs101_group_id UUID;
  cs201_group_id UUID;
  bio_group_id UUID;
  math_group_id UUID;
  buddies_group_id UUID;
BEGIN
  SELECT id INTO cs101_group_id FROM public.study_groups WHERE class_id = (SELECT id FROM public.classes WHERE code = 'CS 101' LIMIT 1) LIMIT 1;
  SELECT id INTO cs201_group_id FROM public.study_groups WHERE class_id = (SELECT id FROM public.classes WHERE code = 'CS 201' LIMIT 1) LIMIT 1;
  SELECT id INTO bio_group_id FROM public.study_groups WHERE class_id = (SELECT id FROM public.classes WHERE code = 'BIO 101' LIMIT 1) LIMIT 1;
  SELECT id INTO math_group_id FROM public.study_groups WHERE class_id = (SELECT id FROM public.classes WHERE code = 'MATH 202' LIMIT 1) LIMIT 1;
  SELECT id INTO buddies_group_id FROM public.study_groups WHERE name = 'Homework Buddies' AND class_id IS NULL LIMIT 1;

  -- Add members to Homework Buddies (Jordan is creator + member)
  INSERT INTO public.study_group_members (group_id, user_id, role) VALUES
    (buddies_group_id, 'a1111111-1111-4111-8111-111111111102', 'member'), -- Jordan (creator)
    (buddies_group_id, 'a1111111-1111-4111-8111-111111111101', 'member'),
    (buddies_group_id, 'a1111111-1111-4111-8111-111111111103', 'member'),
    (buddies_group_id, 'a1111111-1111-4111-8111-111111111104', 'member'),
    (buddies_group_id, 'a1111111-1111-4111-8111-111111111105', 'member')
  ON CONFLICT (group_id, user_id) DO NOTHING;
END $$;

-- Create "Late Night Crammers" general group
INSERT INTO public.study_groups (name, class_id, created_by) VALUES
  ('Late Night Crammers', NULL, 'a1111111-1111-4111-8111-111111111103');

DO $$
DECLARE
  crammers_id UUID;
BEGIN
  SELECT id INTO crammers_id FROM public.study_groups WHERE name = 'Late Night Crammers' AND class_id IS NULL LIMIT 1;
  INSERT INTO public.study_group_members (group_id, user_id) VALUES
    (crammers_id, 'a1111111-1111-4111-8111-111111111103'), -- Sam (creator)
    (crammers_id, 'a1111111-1111-4111-8111-111111111102'),
    (crammers_id, 'a1111111-1111-4111-8111-111111111106'),
    (crammers_id, 'a1111111-1111-4111-8111-111111111107')
  ON CONFLICT (group_id, user_id) DO NOTHING;
END $$;

-- ============================================================
-- 8. Study group sessions (upcoming)
-- ============================================================

INSERT INTO public.study_group_sessions (group_id, scheduled_at, location)
SELECT sg.id, '2025-02-15 18:00:00-05', 'Library Room 204'
FROM public.study_groups sg WHERE sg.name = 'Homework Buddies' AND sg.class_id IS NULL LIMIT 1;

INSERT INTO public.study_group_sessions (group_id, scheduled_at, location)
SELECT sg.id, '2025-02-16 20:00:00-05', 'Student Center - Study Area'
FROM public.study_groups sg WHERE sg.name = 'Late Night Crammers' AND sg.class_id IS NULL LIMIT 1;

INSERT INTO public.study_group_sessions (group_id, scheduled_at, location)
SELECT sg.id, '2025-02-17 14:00:00-05', 'Zoom'
FROM public.study_groups sg
JOIN public.classes c ON sg.class_id = c.id
WHERE c.code = 'CS 101' LIMIT 1;
