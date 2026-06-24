"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-steel-50">
      {/* Brand header */}
      <div className="border-b border-steel-200 bg-white px-6 pb-8 pt-10 text-center">
        <div className="flex justify-center">
          <Logo size={40} />
        </div>
        <p className="mt-6 eyebrow">Champions Rewards</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
          Rewards for contractors
        </h1>
        <p className="mt-1 text-sm text-steel-500">Earn points on every purchase. Unlock rewards.</p>
      </div>

      <div className="px-6 pt-6">
        <div className="rounded-2xl border border-steel-200 bg-white p-6 shadow-card">
          {step === "phone" ? (
            <form onSubmit={requestOtp} className="space-y-4">
              <label className="block text-sm font-semibold text-ink">
                Your name <span className="font-normal text-steel-400">(optional)</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Suresh"
                  className="input mt-1.5"
                />
              </label>
              <label className="block text-sm font-semibold text-ink">
                Mobile number
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  className="input mt-1.5 text-lg tracking-wide"
                />
              </label>
              {error && <p className="text-sm text-century-red">{error}</p>}
              <button disabled={loading} className="btn-primary w-full">
                {loading ? "Sending…" : "Send code"}
              </button>
            </form>
          ) : (
            <form onSubmit={verify} className="space-y-4">
              <p className="text-sm text-steel-600">
                Enter the code sent to <span className="font-bold text-ink">{phone}</span>
              </p>
              {devCode && (
                <p className="rounded-lg bg-century-redSoft px-3 py-2 text-sm text-century-redDark">
                  Test mode code: <span className="font-bold">{devCode}</span>
                </p>
              )}
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                placeholder="6-digit code"
                className="input text-center text-2xl tracking-[0.5em] placeholder:tracking-normal"
              />
              {error && <p className="text-sm text-century-red">{error}</p>}
              <button disabled={loading} className="btn-primary w-full">
                {loading ? "Verifying…" : "Continue"}
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-center text-sm font-semibold text-steel-500"
              >
                ← Change number
              </button>
            </form>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-steel-400">
          Century Steel Profiles · Contractor Rewards Programme
        </p>
      </div>
    </main>
  );
}
