"use client";

import { useState } from "react";
import Link from "next/link";

import { staffRequestPasswordReset } from "@/lib/orders/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OpsForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    await staffRequestPasswordReset(email);
    setPending(false);
    setSent(true);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-accent-soft via-paper-2 to-kraft/40"
      />

      <div className="relative grid w-full max-w-sm gap-5 rounded-[18px] border border-line bg-paper p-7 shadow-lift">
        <div>
          <h1 className="text-lg font-bold">Reset your password</h1>
          <p className="text-sm text-muted">
            {sent
              ? "If that email has access to the ops board, we've sent a reset link — check your inbox."
              : "Enter your email and we'll send you a link to set a new password."}
          </p>
        </div>

        {!sent && (
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={pending || !email}
              className="bg-linear-to-r from-accent to-accent-2 text-paper hover:from-accent-2 hover:to-accent-2"
            >
              {pending ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}

        <Link href="/ops/login" className="text-sm text-muted hover:text-ink hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
