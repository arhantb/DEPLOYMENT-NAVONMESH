"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ALERTS = [
    {
        id: 1,
        type: "red",
        badge: "🚨 Heavy Traffic",
        title: "FC Road → Shivajinagar",
        body: "Congestion: 84/100 · Mappls live · Avoid cab — 40 min delay",
        time: "Now",
        tip: "🚇 Take Deccan Gymkhana Metro (Aqua Line) — saves 28 min",
        action: "View Metro Route",
        icon: "🚦",
    },
    {
        id: 2,
        type: "orange",
        badge: "⚠️ Event Alert",
        title: "Swargate, Pune",
        body: "IPL Match at MCA Stadium · ~40,000 crowd expected · 5–10 PM peak",
        time: "2h ago",
        tip: "🚇 Take Swargate Metro (Purple Line) — avoid Pune-Satara Rd",
        action: "Plan Route",
        icon: "🎪",
    },
    {
        id: 3,
        type: "green",
        badge: "✅ Clear Route",
        title: "Kothrud → Hinjewadi IT Park",
        body: "Congestion: 18/100 · 18 km · Est. 22 min by road",
        time: "3 min ago",
        tip: "🚗 Road trip is optimal right now — good window till 6 PM",
        action: "Start Navigation",
        icon: "🛣️",
    },
    {
        id: 4,
        type: "blue",
        badge: "🌧️ Weather Alert",
        title: "Pune — Rain Advisory",
        body: "Light rain expected 5–8 PM · Waterlogging risk: Swargate, Kothrud",
        time: "Just now",
        tip: "🚇 Pre-book metro tickets — road speed drops 40% in rain",
        action: "Check Metro Timings",
        icon: "🌧️",
    },
    {
        id: 5,
        type: "purple",
        badge: "🚇 Metro Tip",
        title: "Daily Commute Optimised",
        body: "Your route: Magarpatta → Shivajinagar · Peak window: 8–10 AM",
        time: "7:50 AM",
        tip: "🚇 Kalyani Nagar Metro → Ruby Hall Clinic → Shivajinagar · 19 min",
        action: "Save Route",
        icon: "🤖",
    },
];

const TYPE_COLORS: Record<string, { bar: string; badge: string; tip: string; btn: string }> = {
    red: { bar: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200", tip: "bg-red-50 text-red-700", btn: "bg-red-600 hover:bg-red-700 text-white" },
    orange: { bar: "bg-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-200", tip: "bg-orange-50 text-orange-700", btn: "bg-orange-500 hover:bg-orange-600 text-white" },
    green: { bar: "bg-green-500", badge: "bg-green-50 text-green-700 border-green-200", tip: "bg-green-50 text-green-700", btn: "bg-green-600 hover:bg-green-700 text-white" },
    blue: { bar: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200", tip: "bg-blue-50 text-blue-700", btn: "bg-blue-600 hover:bg-blue-700 text-white" },
    purple: { bar: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200", tip: "bg-purple-50 text-purple-700", btn: "bg-purple-600 hover:bg-purple-700 text-white" },
};

export function WhatsAppNotificationStack() {
    const [current, setCurrent] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const [dismissed, setDismissed] = useState<number[]>([]);
    const [visible, setVisible] = useState(true);
    const timerId = useRef<ReturnType<typeof setInterval> | null>(null);

    const alert = ALERTS[current];
    const colors = TYPE_COLORS[alert.type];

    const next = () => {
        setExpanded(false);
        setCurrent((p) => (p + 1) % ALERTS.length);
        setVisible(true);
    };

    const dismiss = () => {
        setDismissed((d) => [...d, alert.id]);
        setVisible(false);
        setTimeout(next, 300);
    };

    // Auto-cycle every 6 seconds
    useEffect(() => {
        timerId.current = setInterval(() => {
            if (!expanded) next();
        }, 6000);
        return () => { if (timerId.current) clearInterval(timerId.current); };
    }, [expanded, current]);

    return (
        <div className="w-full">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#25D366] rounded-xl flex items-center justify-center shadow">
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-900">Tram.AI on WhatsApp</p>
                        <p className="text-[10px] text-slate-400">Proactive traffic alerts · Pune</p>
                    </div>
                </div>
                {/* Dot indicators */}
                <div className="flex gap-1.5">
                    {ALERTS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { setCurrent(i); setExpanded(false); setVisible(true); }}
                            className={`rounded-full transition-all duration-300 ${i === current ? "w-4 h-1.5 bg-green-600" : "w-1.5 h-1.5 bg-slate-200 hover:bg-slate-300"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Notification card */}
            <AnimatePresence mode="wait">
                {visible && (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: -16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden"
                    >
                        {/* Colour bar */}
                        <div className={`h-1 w-full ${colors.bar}`} />

                        <div className="p-4">
                            {/* Top row */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                    {/* Icon */}
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                                        {alert.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {/* Badge */}
                                        <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1 ${colors.badge}`}>
                                            {alert.badge}
                                        </span>
                                        <p className="text-sm font-bold text-slate-900 leading-tight">{alert.title}</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{alert.body}</p>
                                    </div>
                                </div>
                                {/* Time + dismiss */}
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <span className="text-[10px] text-slate-400">{alert.time}</span>
                                    <button onClick={dismiss} className="text-slate-300 hover:text-slate-500 transition-colors text-lg leading-none">×</button>
                                </div>
                            </div>

                            {/* Expand toggle */}
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="mt-3 text-[11px] text-slate-400 hover:text-green-600 font-semibold flex items-center gap-1 transition-colors"
                            >
                                {expanded ? "▲ Less info" : "▼ View recommendation"}
                            </button>

                            {/* Expanded tip */}
                            <AnimatePresence>
                                {expanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`mt-3 p-3 rounded-xl text-[11px] font-medium leading-snug ${colors.tip}`}>
                                            {alert.tip}
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <button className={`flex-1 text-[11px] font-bold py-2 px-3 rounded-xl transition-colors ${colors.btn}`}>
                                                {alert.action}
                                            </button>
                                            <button onClick={dismiss} className="text-[11px] font-bold py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                                                Dismiss
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation arrows */}
            <div className="flex justify-between items-center mt-3">
                <button
                    onClick={() => { setCurrent((p) => (p - 1 + ALERTS.length) % ALERTS.length); setExpanded(false); setVisible(true); }}
                    className="text-[11px] text-slate-400 hover:text-green-600 font-semibold transition-colors flex items-center gap-1"
                >
                    ← Prev
                </button>
                <span className="text-[10px] text-slate-300 font-medium">
                    {current + 1} of {ALERTS.length} alerts
                </span>
                <button
                    onClick={next}
                    className="text-[11px] text-slate-400 hover:text-green-600 font-semibold transition-colors flex items-center gap-1"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
