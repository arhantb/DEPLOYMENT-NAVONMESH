import { TrendingDown, TrendingUp, AlertTriangle, Clock4, Activity, MapPin } from "lucide-react";

const summaryCards = [
  {
    id: "congestion",
    label: "Congestion Index",
    value: "68%",
    chip: "Pune Metro Region",
    deltaLabel: "vs last month",
    delta: "+6%",
    positive: false,
    sub: "Peak: Hinjewadi & Swargate",
  },
  {
    id: "incidents",
    label: "Incidents Today",
    value: "14",
    chip: "Collisions & breakdowns",
    deltaLabel: "above daily baseline",
    delta: "+3",
    positive: false,
    sub: "3 major, 11 minor events",
  },
  {
    id: "closures",
    label: "Active Road Closures",
    value: "7",
    chip: "Planned + unplanned",
    deltaLabel: "below festival peak",
    delta: "-4",
    positive: true,
    sub: "2 expressway, 5 arterial",
  },
  {
    id: "delay",
    label: "Avg Corridor Delay",
    value: "9 min",
    chip: "Evening peak 6–8 PM",
    deltaLabel: "vs free‑flow",
    delta: "+3 min",
    positive: false,
    sub: "Worst: FC Road (+14 min)",
  },
];

export function PuneSummaryCards() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => {
        const Icon =
          card.id === "congestion"
            ? Activity
            : card.id === "delay"
              ? Clock4
              : card.id === "closures"
                ? MapPin
                : AlertTriangle;

        return (
          <article
            key={card.id}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)] transition-shadow duration-300"
          >
            {/* Top accent bar — matches landing page green-600 brand */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-green-600 via-green-400 to-orange-400" />

            <div className="flex items-start justify-between gap-3 pt-2">
              <div className="space-y-2 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  {card.label}
                </p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </p>
                <p className="inline-flex items-center rounded-full bg-green-50 border border-green-100 px-2.5 py-0.5 text-[10px] font-semibold text-green-700 uppercase tracking-wider">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
                  {card.chip}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">{card.sub}</p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    card.positive
                      ? "bg-green-600/10 text-green-700"
                      : "bg-orange-500/10 text-orange-700"
                  }`}
                >
                  {card.positive ? (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  )}
                  {card.delta}
                </span>
                <p className="text-[10px] text-slate-400 font-medium text-right leading-tight max-w-[80px]">
                  {card.deltaLabel}
                </p>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 border border-green-100 text-green-700 mt-1">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
