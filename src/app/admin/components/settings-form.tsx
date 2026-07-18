"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SettingsFormProps {
  onLogout: () => Promise<void>;
}

export function SettingsForm({ onLogout }: SettingsFormProps) {
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSettingsSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newEmail: newEmail.trim() || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      toast.success("Settings updated! Logging out...");

      // Auto logout and redirect
      setTimeout(() => {
        onLogout();
      }, 1500);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile settings"
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl rounded-xl border border-border bg-card/60 p-8 backdrop-blur-xl"
    >
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold tracking-wide">
          Account Credentials
        </h2>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          Update your login email address and secure password.
        </p>
      </div>

      <form onSubmit={handleSettingsSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
            New Email Address (Optional)
          </label>
          <Input
            type="email"
            placeholder="Leave blank to keep current email"
            value={newEmail}
            onChange={(e) => setNewEmail((e.target as HTMLInputElement).value)}
            className="font-sans"
          />
        </div>

        <div className="h-px bg-border my-2" />

        {/* Password */}
        <div className="space-y-1.5">
          <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
            New Password
          </label>
          <Input
            type="password"
            placeholder="Min 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword((e.target as HTMLInputElement).value)}
            className="font-sans"
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Confirm New Password
          </label>
          <Input
            type="password"
            placeholder="Re-type new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
            className="font-sans"
          />
        </div>

        <div className="h-px bg-border my-2" />

        {/* Current Password Verification */}
        <div className="space-y-1.5">
          <label className="font-sans text-xs font-medium uppercase tracking-wider text-accent font-semibold">
            Verify Current Password *
          </label>
          <Input
            type="password"
            placeholder="Enter current password to save changes"
            value={currentPassword}
            onChange={(e) => setCurrentPassword((e.target as HTMLInputElement).value)}
            className="font-sans border-accent/45 focus:border-accent"
            required
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={settingsSaving}
          className="w-full rounded-full bg-accent py-3 font-sans text-sm font-semibold text-accent-foreground transition-all duration-300 hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 h-auto"
        >
          {settingsSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes…
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </form>
    </motion.div>
  );
}
