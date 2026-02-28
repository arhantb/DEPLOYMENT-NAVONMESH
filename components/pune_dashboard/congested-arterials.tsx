"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type CorridorType = "highways" | "nonHighways" | "all";

interface Corridor {
  id: string;
  name: string;
  type: CorridorType;
  congestion: number;
  change: number;
}

const corridors: Corridor[] = [
  {
    id: "mumbai-pune",
    name: "Mumbai–Pune Expressway",
    type: "highways",
    congestion: 82,
    change: 5,
  },
  {
    id: "nh60",
    name: "NH 60 – Nashik Phata",
    type: "highways",
    congestion: 76,
    change: 3,
  },
  {
    id: "solapur-rd",
    name: "Solapur Rd – Hadapsar",
    type: "highways",
    congestion: 69,
    change: -2,
  },
  {
    id: "nh48",
    name: "NH 48 – Pune Bypass",
    type: "highways",
    congestion: 74,
    change: 4,
  },
  {
    id: "hbk",
    name: "Hinjewadi Phase 1–3",
    type: "nonHighways",
    congestion: 88,
    change: 7,
  },
  {
    id: "sb-road",
    name: "SB Road – University Circle",
    type: "nonHighways",
    congestion: 73,
    change: 1,
  },
  {
    id: "fc-road",
    name: "FC Road – JM Road Loop",
    type: "nonHighways",
    congestion: 64,
    change: -3,
  },
  {
    id: "kothrud",
    name: "Kothrud Depot – Paud Rd",
    type: "nonHighways",
    congestion: 59,
    change: -1,
  },
  {
    id: "baner",
    name: "Baner – Balewadi High St",
    type: "nonHighways",
    congestion: 77,
    change: 6,
  },
  {
    id: "katraj",
    name: "Katraj – Swargate Bypass",
    type: "nonHighways",
    congestion: 71,
    change: 2,
  },
];

const filters: { id: CorridorType; label: string }[] = [
  { id: "highways", label: "Highways" },
  { id: "nonHighways", label: "Non‑Highways" },
  { id: "all", label: "All Arterials" },
];

export function PuneCongestedArterials() {
  const [filter, setFilter] = useState<CorridorType>("highways");

  const visible = corridors
    .filter((c) => (filter === "all" ? true : c.type === filter))
    .sort((a, b) => b.congestion - a.congestion)
    .slice(0, 6);

  return (
    <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)] transition-shadow duration-300">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Most congested corridors
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Live density index across key Pune arterials
          </p>
        </div>
        <div className="inline-flex items-center rounded-xl bg-slate-100 border border-slate-200 p-1 text-xs">
          {filters.map((f) => (
            <button
              key={f.id}
              className={cn(
                "rounded-lg px-3 py-1.5 font-bold uppercase tracking-wider transition-all text-[10px]",
                filter === f.id
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-3 overflow-y-auto pr-1">
        {visible.map((corridor) => {
          const isHeavy = corridor.congestion >= 80;
          const barColor = isHeavy
            ? "from-orange-400 via-red-500 to-orange-500"
            : "from-green-600 via-gray-300 to-green-600";

          return (
            <article
              key={corridor.id}
              className="rounded-xl border border-slate-200 bg-[#f7f8fa] px-3 py-2.5 shadow-sm hover:border-green-200 hover:bg-green-50/30 transition-colors duration-200"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {corridor.name}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-green-600" />
                    {corridor.type === "highways"
                      ? "National / expressway"
                      : "Urban arterial"}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-sm font-black text-slate-900">
                    {corridor.congestion}%
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-[10px] font-bold",
                      corridor.change >= 0
                        ? "text-orange-700"
                        : "text-green-700",
                    )}
                  >
                    {corridor.change >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(corridor.change)} pts
                  </p>
                </div>
              </div>

              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
                <div
                  className={cn(
                    "h-1.5 rounded-full bg-gradient-to-r transition-all duration-500",
                    barColor,
                  )}
                  style={{ width: `${corridor.congestion}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

