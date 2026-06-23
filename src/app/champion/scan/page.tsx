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

  // Load current progress on mount so the header reflects reality immediately.
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
          { serial: value, status: "ok", message: `+${data.pointsEarned} • ${data.productName}` },
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
    <main className="mx-auto min-h-screen max-w-md bg-steel-50 px-5 pb-24 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/champion" className="text-sm text-steel-700">
          ← Back
        </Link>
        <h1 className="text-lg font-bold">Enter serial codes</h1>
        <span className="w-10" />
      </div>

      {/* Forward-looking goal stays visible while typing */}
      {nextChest && (
        <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
          <ProgressBar percent={nextChest.percent} />
          <p className="mt-2 text-center text-sm font-semibold text-steel-700">
            {nextChest.pointsRemaining} more to open your {nextChest.displayName}
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
          className="w-full rounded-xl border-2 border-steel-100 bg-white px-4 py-4 text-center text-xl font-semibold uppercase tracking-wider focus:border-champion focus:outline-none"
        />
        <button
          disabled={loading || !serial.trim()}
          className="w-full rounded-xl bg-champion py-4 text-lg font-bold text-white disabled:opacity-50"
        >
          {loading ? "Checking…" : "Verify & add"}
        </button>
      </form>

      <p className="mt-3 text-center text-xs text-steel-700/60">
        Add each packet's code one at a time — you'll see it count up instantly.
      </p>

      {addedCount > 0 && (
        <p className="mt-5 text-center text-sm font-semibold text-champion">
          {addedCount} code{addedCount > 1 ? "s" : ""} added this session 🎉
        </p>
      )}

      {/* Running list of this session's entries */}
      <ul className="mt-3 space-y-2">
        {entries.map((entry, i) => (
          <li
            key={i}
            className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm ${
              entry.status === "ok" ? "bg-champion/10" : "bg-red-50"
            }`}
          >
            <span className="font-mono font-semibold">{entry.serial}</span>
            <span className={entry.status === "ok" ? "text-champion-dark" : "text-red-600"}>
              {entry.status === "ok" ? "✓ " : "✕ "}
              {entry.message}
            </span>
          </li>
        ))}
      </ul>

      {/* Chest-open celebration overlay */}
      {celebrate && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-steel-900/90 px-6">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-champion-dark to-steel-900 p-8 text-center text-white ring-1 ring-treasure-gold/40">
            <TreasureChest open size={170} />
            <h2 className="mt-3 text-2xl font-extrabold text-treasure-gold">Chest unlocked!</h2>
            {celebrate.map((c) => (
              <div key={c.couponCode} className="mt-4 rounded-2xl bg-white/10 p-4">
                <p className="text-lg font-bold">{c.displayName}</p>
                <p className="text-treasure-gold">{c.rewardValue}</p>
                <p className="mt-2 text-xs text-white/70">Coupon code</p>
                <p className="font-mono text-lg font-bold tracking-wider">{c.couponCode}</p>
              </div>
            ))}
            <p className="mt-4 text-xs text-white/70">
              Show this coupon at the Century Steels counter to claim your reward.
            </p>
            <button
              onClick={() => setCelebrate(null)}
              className="mt-5 w-full rounded-xl bg-treasure-gold py-3 font-bold text-steel-900"
            >
              Keep hunting
            </button>
          </div>
        </div>
      )}

      <BottomNav active="/champion/scan" />
    </main>
  );
}
