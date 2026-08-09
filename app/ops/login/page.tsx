"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { staffLogin } from "@/lib/orders/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OpsLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(false);
    const { ok } = await staffLogin(pin);
    setPending(false);
    if (ok) {
      router.replace("/ops");
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="grid w-full max-w-sm gap-4 rounded-[18px] border border-line bg-paper p-6 shadow-soft">
        <div>
          <h1 className="text-lg font-bold">Media Print Pack — Operations</h1>
          <p className="text-sm text-muted">Enter the staff PIN to open the board.</p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pin">PIN</Label>
          <Input
            id="pin"
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm font-semibold text-danger">Wrong PIN — try again.</p>}
        <Button type="submit" disabled={pending || !pin} className="bg-accent hover:bg-accent-2">
          {pending ? "Checking…" : "Enter"}
        </Button>
      </form>
    </div>
  );
}
