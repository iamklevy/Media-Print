"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { staffLogin } from "@/lib/orders/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OpsLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const { ok, error } = await staffLogin(email, password);
    setPending(false);
    if (ok) {
      router.replace("/ops");
      router.refresh();
    } else {
      setError(error ?? "Something went wrong — try again.");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-accent-soft via-paper-2 to-kraft/40"
      />

      <form
        onSubmit={onSubmit}
        className="relative grid w-full max-w-sm gap-5 rounded-[18px] border border-line bg-paper p-7 shadow-lift"
      >
        <div className="grid justify-items-center gap-3 text-center">
          <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-2 shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="size-full object-contain" />
          </span>
          <div>
            <h1 className="text-lg font-bold">Media Print Pack</h1>
            <p className="text-sm text-muted">Sign in to manage orders.</p>
          </div>
        </div>

        <div className="grid gap-3">
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
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/ops/forgot-password" className="text-xs text-muted hover:text-ink hover:underline">
                Forgot your password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
        </div>

        {error && <p className="text-sm font-semibold text-danger">{error}</p>}

        <Button
          type="submit"
          disabled={pending || !email || !password}
          className="bg-linear-to-r from-accent to-accent-2 text-paper hover:from-accent-2 hover:to-accent-2"
        >
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
