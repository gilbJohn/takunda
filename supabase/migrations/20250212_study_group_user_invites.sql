-- Run this in Supabase SQL Editor if you already have the schema and need to add study_group_user_invites

CREATE TABLE IF NOT EXISTS public.study_group_user_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, recipient_id)
);

GRANT ALL ON public.study_group_user_invites TO authenticated;

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
