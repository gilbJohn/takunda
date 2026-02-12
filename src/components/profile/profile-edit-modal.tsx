"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/types/user";

export interface ProfileEditModalProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { name: string; phone?: string; school?: string; major?: string }) => Promise<void>;
}

export function ProfileEditModal({
  user,
  open,
  onOpenChange,
  onSave,
}: ProfileEditModalProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [school, setSchool] = useState(user.school ?? "");
  const [major, setMajor] = useState(user.major ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync form state when modal opens or user changes (fixes stale data when reopening)
  useEffect(() => {
    if (open) {
      setName(user.name);
      setPhone(user.phone ?? "");
      setSchool(user.school ?? "");
      setMajor(user.major ?? "");
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        phone: phone.trim() || undefined,
        school: school.trim() || undefined,
        major: major.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-phone" className="text-sm font-medium">
                Phone
              </label>
              <Input
                id="edit-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-school" className="text-sm font-medium">
                School
              </label>
              <Input
                id="edit-school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Your school"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-major" className="text-sm font-medium">
                Major
              </label>
              <Input
                id="edit-major"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="Your major"
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
