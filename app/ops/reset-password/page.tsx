"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { staffSetNewPassword } from "@/lib/orders/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token_hash");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tokenHash) {
      setError("This reset link is invalid or has expired.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setPending(true);
    setError(null);
    const { ok, error } = await staffSetNewPassword(tokenHash, password);
    setPending(false);
    if (ok) {
      router.replace("/ops");
      router.refresh();
    } else {
      setError(error ?? "Something went wrong — try again.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative grid w-full max-w-sm gap-5 rounded-[18px] border border-line bg-paper p-7 shadow-lift"
    >
      <div>
        <h1 className="text-lg font-bold">Set a new password</h1>
        <p className="text-sm text-muted">Choose a password for your ops account.</p>
      </div>

      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pe-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 end-0 grid w-9 place-items-center text-muted hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
      </div>

      {error && <p className="text-sm font-semibold text-danger">{error}</p>}

      <Button
        type="submit"
        disabled={pending || !password || !confirm}
        className="bg-linear-to-r from-accent to-accent-2 text-paper hover:from-accent-2 hover:to-accent-2"
      >
        {pending ? "Saving…" : "Save password"}
      </Button>
    </form>
  );
}

export default function OpsResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-accent-soft via-paper-2 to-kraft/40"
      />
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
