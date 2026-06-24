"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/ProgressBar";
import { TreasureChest } from "@/components/TreasureChest";
import { BottomNav } from "@/components/BottomNav";

type Entry = { serial: string; status: "ok" | "error"; message: string };
type NextChest = {
  displayName: string;
  rewardValue: string;
  pointsRemaining: number;
  percent: number;
} | null;
type ChestOpened = { displayName: string; rewardValue: string; couponCode: string };

export default function ScanPage() {
  const [serial, setSerial] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [nextChest, setNextChest] = useState<NextChest>(null);
  const [loading, setLoading] = useState(false);
  const [celebrate, setCelebrate] = useState<ChestOpened[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => p && setNextChest(p.nextChest))
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = serial.trim();
    if (!value || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial: value }),
      });
      const data = await res.json();

      if (res.status === 401) {
        window.location.href = "/champion/login";
        return;
      }

      if (data.ok) {
        setEntries((prev) => [
          { serial: value, status: "ok", message: `+${data.pointsEarned} · ${data.productName}` },
          ...prev,
        ]);
        setNextChest(data.progress?.nextChest ?? null);
        if (data.chestsOpened?.length) setCelebrate(data.chestsOpened);
      } else {
        setEntries((prev) => [
          { serial: value, status: "error", message: data.message || "Could not add this code" },
          ...prev,
        ]);
      }
      setSerial("");
      inputRef.current?.focus();
    } catch {
      setEntries((prev) => [
        { serial: value, status: "error", message: "Network error, try again" },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  }

  const addedCount = entries.filter((e) => e.status === "ok").length;

  return (
    <main className="mx-auto min-h-screen max-w-md bg-steel-50 pb-24">
      <header className="flex items-center justify-between border-b border-steel-200 bg-white px-5 py-4">
        <Link href="/champion" className="text-sm font-semibold text-steel-600">
          ← Back
        </Link>
        <h1 className="text-sm font-bold uppercase tracking-wide text-ink">Enter Codes</h1>
        <span className="w-12" />
      </header>

      <div className="px-5 pt-5">
        {nextChest && (
          <div className="mb-5 rounded-xl border border-steel-200 bg-white p-4">
            <ProgressBar percent={nextChest.percent} />
            <p className="mt-2 text-center text-sm font-semibold text-steel-600">
              <span className="text-century-red">{nextChest.pointsRemaining} more</span> to unlock{" "}
              {nextChest.displayName}
            </p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <input
            ref={inputRef}
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            autoFocus
            autoCapitalize="characters"
            autoComplete="off"
            placeholder="Type the code on the packet"
            className="input text-center text-xl font-semibold uppercase tracking-wider"
          />
          <button disabled={loading || !serial.trim()} className="btn-primary w-full">
            {loading ? "Checking…" : "Verify & add"}
          </button>
        </form>

        <p className="mt-3 text-center text-xs text-steel-400">
          Add each packet&apos;s code one at a time — it counts up instantly.
        </p>

        {addedCount > 0 && (
          <p className="mt-5 text-center text-sm font-bold text-century-red">
            {addedCount} code{addedCount > 1 ? "s" : ""} added this session
          </p>
        )}

        <ul className="mt-3 space-y-2">
          {entries.map((entry, i) => (
            <li
              key={i}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
                entry.status === "ok"
                  ? "border-steel-200 bg-white"
                  : "border-century-red/30 bg-century-redSoft"
              }`}
            >
              <span className="font-mono font-semibold text-ink">{entry.serial}</span>
              <span
                className={`font-semibold ${
                  entry.status === "ok" ? "text-ink" : "text-century-redDark"
                }`}
              >
                {entry.status === "ok" ? "✓ " : "✕ "}
                {entry.message}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {celebrate && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/90 px-6">
          <div className="w-full max-w-sm rounded-2xl border border-steel-700 bg-ink-800 p-8 text-center text-white">
            <TreasureChest open size={160} />
            <h2 className="mt-3 text-2xl font-extrabold uppercase tracking-tight text-white">
              Reward unlocked!
            </h2>
            {celebrate.map((c) => (
              <div key={c.couponCode} className="mt-4 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                <p className="text-lg font-bold">{c.displayName}</p>
                <p className="text-century-red">{c.rewardValue}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-white/50">Coupon code</p>
                <p className="font-mono text-lg font-bold tracking-wider">{c.couponCode}</p>
              </div>
            ))}
            <p className="mt-4 text-xs text-white/60">
              Show this coupon at the Century Steel counter to claim your reward.
            </p>
            <button onClick={() => setCelebrate(null)} className="btn-primary mt-5 w-full">
              Keep going
            </button>
          </div>
        </div>
      )}

      <BottomNav active="/champion/scan" />
    </main>
  );
}
