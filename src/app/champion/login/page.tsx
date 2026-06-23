"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TreasureChest } from "@/components/TreasureChest";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send code");
      setDevCode(data.devCode ?? null);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not verify");
      router.push("/champion");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-gradient-to-b from-steel-900 to-champion-dark px-6 text-white">
      <div className="text-center">
        <TreasureChest size={130} />
        <p className="mt-2 text-xs uppercase tracking-widest text-white/60">Century</p>
        <h1 className="text-3xl font-extrabold">Champions</h1>
        <p className="mt-1 text-sm text-white/70">Start your treasure hunt</p>
      </div>

      <div className="mt-8 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
        {step === "phone" ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <label className="block text-sm text-white/80">
              Your name (optional)
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Suresh"
                className="mt-1 w-full rounded-xl bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-treasure-gold"
              />
            </label>
            <label className="block text-sm text-white/80">
              Mobile number
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="numeric"
                placeholder="10-digit mobile number"
                className="mt-1 w-full rounded-xl bg-white/10 px-4 py-3 text-lg tracking-wide text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-treasure-gold"
              />
            </label>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-treasure-gold py-3 text-lg font-bold text-steel-900 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <p className="text-sm text-white/80">
              Enter the code sent to <span className="font-semibold">{phone}</span>
            </p>
            {devCode && (
              <p className="rounded-lg bg-treasure-gold/20 px-3 py-2 text-sm text-treasure-gold">
                Dev mode code: <span className="font-bold">{devCode}</span>
              </p>
            )}
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              placeholder="6-digit code"
              className="w-full rounded-xl bg-white/10 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white placeholder:tracking-normal placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-treasure-gold"
            />
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-treasure-gold py-3 text-lg font-bold text-steel-900 disabled:opacity-60"
            >
              {loading ? "Verifying…" : "Enter the hunt"}
            </button>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-center text-sm text-white/60"
            >
              ← Change number
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
