"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ContractorView, Redemption, Reward, Tier } from "@/lib/types";

interface Dashboard {
  contractors: ContractorView[];
  rewards: Reward[];
  redemptions: Redemption[];
  stats: {
    totalContractors: number;
    totalPointsAwarded: number;
    totalRedemptions: number;
    pointsOutstanding: number;
  };
}

const TIER_STYLES: Record<Tier, string> = {
  Bronze: "bg-amber-900/40 text-amber-300 ring-amber-700/50",
  Silver: "bg-slate-500/20 text-slate-200 ring-slate-400/40",
  Gold: "bg-yellow-500/20 text-yellow-300 ring-yellow-500/40",
  Platinum: "bg-cyan-400/20 text-cyan-200 ring-cyan-300/40",
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Request failed");
  return data as T;
}

export default function Home() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [amount, setAmount] = useState<string>("250");
  const [reason, setReason] = useState<string>("Completed steel order");
  const [name, setName] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(
    null,
  );

  const refresh = useCallback(async () => {
    const res = await fetch("/api/state", { cache: "no-store" });
    const json: Dashboard = await res.json();
    setData(json);
    setSelectedId((prev) =>
      prev && json.contractors.some((c) => c.id === prev)
        ? prev
        : (json.contractors[0]?.id ?? ""),
    );
  }, []);

  useEffect(() => {
    // Load the dashboard on mount. State updates happen only after the awaited
    // fetch resolves, so this is a one-time sync with an external system.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const flash = useCallback((kind: "ok" | "err", msg: string) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const selected = useMemo(
    () => data?.contractors.find((c) => c.id === selectedId) ?? null,
    [data, selectedId],
  );

  async function handleAddContractor(e: React.FormEvent) {
    e.preventDefault();
    try {
      const created = await postJson<ContractorView>("/api/contractors", {
        name,
        company,
      });
      setName("");
      setCompany("");
      await refresh();
      setSelectedId(created.id);
      flash("ok", `Enrolled ${created.name}.`);
    } catch (err) {
      flash("err", (err as Error).message);
    }
  }

  async function handleAward(e: React.FormEvent) {
    e.preventDefault();
    try {
      const updated = await postJson<ContractorView>("/api/points", {
        contractorId: selectedId,
        amount: Number(amount),
        reason,
      });
      await refresh();
      flash("ok", `Awarded ${amount} pts to ${updated.name}.`);
    } catch (err) {
      flash("err", (err as Error).message);
    }
  }

  async function handleRedeem(rewardId: string) {
    if (!selectedId) {
      flash("err", "Select a contractor first.");
      return;
    }
    try {
      const { redemption } = await postJson<{ redemption: Redemption }>(
        "/api/redeem",
        { contractorId: selectedId, rewardId },
      );
      await refresh();
      flash("ok", `Redeemed "${redemption.rewardName}".`);
    } catch (err) {
      flash("err", (err as Error).message);
    }
  }

  if (!data) {
    return (
      <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-8 text-slate-400">
        Loading Century Champions…
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6 sm:p-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
            Century Steels
          </p>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-white">
            Century Champions
          </h1>
          <p className="mt-1 text-slate-400">
            Contractor rewards program dashboard
          </p>
        </div>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Contractors" value={data.stats.totalContractors} />
        <StatCard
          label="Lifetime Points"
          value={data.stats.totalPointsAwarded.toLocaleString()}
        />
        <StatCard
          label="Points Outstanding"
          value={data.stats.pointsOutstanding.toLocaleString()}
        />
        <StatCard label="Redemptions" value={data.stats.totalRedemptions} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <Panel title="Leaderboard">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-2 pr-3">#</th>
                    <th className="py-2 pr-3">Contractor</th>
                    <th className="py-2 pr-3">Tier</th>
                    <th className="py-2 pr-3 text-right">Balance</th>
                    <th className="py-2 text-right">Lifetime</th>
                  </tr>
                </thead>
                <tbody>
                  {data.contractors.map((c, i) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={`cursor-pointer border-t border-white/5 transition hover:bg-white/5 ${
                        c.id === selectedId ? "bg-amber-500/10" : ""
                      }`}
                    >
                      <td className="py-3 pr-3 text-slate-500">{i + 1}</td>
                      <td className="py-3 pr-3">
                        <div className="font-semibold text-white">{c.name}</div>
                        <div className="text-xs text-slate-400">{c.company}</div>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TIER_STYLES[c.tier]}`}
                        >
                          {c.tier}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right font-mono text-amber-300">
                        {c.points.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        {c.lifetimePoints.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="mt-6">
            <Panel title="Rewards Catalog">
              {selected ? (
                <p className="mb-4 text-sm text-slate-400">
                  Redeeming for{" "}
                  <span className="font-semibold text-white">
                    {selected.name}
                  </span>{" "}
                  · balance{" "}
                  <span className="font-mono text-amber-300">
                    {selected.points.toLocaleString()}
                  </span>
                </p>
              ) : (
                <p className="mb-4 text-sm text-slate-400">
                  Select a contractor from the leaderboard to redeem.
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {data.rewards.map((r) => {
                  const affordable = !!selected && selected.points >= r.cost;
                  return (
                    <div
                      key={r.id}
                      className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-white">{r.name}</h3>
                          <span className="font-mono text-sm text-amber-300">
                            {r.cost.toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {r.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRedeem(r.id)}
                        disabled={!affordable}
                        className="mt-3 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-slate-900 transition enabled:hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500"
                      >
                        {affordable ? "Redeem" : "Not enough points"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        </section>

        <section className="space-y-6">
          <Panel title="Award Points">
            <form onSubmit={handleAward} className="space-y-3">
              <Field label="Contractor">
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                >
                  {data.contractors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Points">
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                />
              </Field>
              <Field label="Reason">
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                />
              </Field>
              <button
                type="submit"
                className="w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
              >
                Award Points
              </button>
            </form>
          </Panel>

          <Panel title="Enroll Contractor">
            <form onSubmit={handleAddContractor} className="space-y-3">
              <Field label="Name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Steelworks"
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                />
              </Field>
              <Field label="Company">
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Apex Inc."
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400"
                />
              </Field>
              <button
                type="submit"
                className="w-full rounded-lg border border-amber-500/60 px-3 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/10"
              >
                Enroll
              </button>
            </form>
          </Panel>

          <Panel title="Recent Redemptions">
            {data.redemptions.length === 0 ? (
              <p className="text-sm text-slate-500">No redemptions yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.redemptions.slice(0, 6).map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between border-t border-white/5 pt-2 first:border-0 first:pt-0"
                  >
                    <span className="text-slate-300">{r.rewardName}</span>
                    <span className="font-mono text-xs text-amber-300">
                      -{r.cost.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg px-4 py-2 text-sm font-medium shadow-lg ring-1 ring-inset ${
            toast.kind === "ok"
              ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/40"
              : "bg-rose-500/15 text-rose-300 ring-rose-500/40"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}
