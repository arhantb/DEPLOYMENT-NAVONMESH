"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// ── Real conversation from actual live bot responses ──────────────────────────
const CONVERSATION = [
    { role: "user", text: "Hi", time: "05:21 am" },
    {
        role: "bot",
        delay: 1800,
        time: "05:21 am",
        text: `👋 *Hey! Welcome to Tram.AI* 🚦

I can help you with:
  🗺️ *Commute planning* — type *go*
  🎪 *Area events & traffic* — e.g.:
       _"Any events near Swargate?"_
       _"Metro near Magarpatta"_

What would you like to do?`,
    },
    { role: "user", text: "Go", time: "05:21 am", delay: 900 },
    {
        role: "bot",
        delay: 1200,
        time: "05:21 am",
        text: `📍 *Where are you starting from?*

Type the area or landmark.
_Example: Deccan Gymkhana, Kothrud_`,
    },
    { role: "user", text: "Swargate", time: "05:22 am", delay: 1100 },
    {
        role: "bot",
        delay: 1400,
        time: "05:22 am",
        text: `✅ *Origin:* Swargate, Pune
  🚇 Swargate (Purple Line) — 0.08 km
  🚇 Mandai (Purple Line) — 0.94 km

📍 *Where do you want to go?*

_Example: Hinjewadi IT Park, Magarpatta_`,
    },
    { role: "user", text: "Magarpatta City", time: "05:22 am", delay: 1000 },
    {
        role: "bot",
        delay: 1500,
        time: "05:22 am",
        text: `✅ *Destination:* Magarpatta City, Pune
  🚇 Ramwadi (Aqua Line) — 2.1 km
  🚇 Kalyani Nagar (Aqua Line) — 2.8 km

🛣️ Route: *Swargate* → *Magarpatta City*

⏱️ *How many minutes do you have?*
_Reply with a number. Example: 30_`,
    },
    { role: "user", text: "45", time: "05:23 am", delay: 800 },
    {
        role: "bot",
        delay: 3000,
        time: "05:23 am",
        isReport: true,
        text: `🚦 *Tram.AI Commute Report*
━━━━━━━━━━━━━━━━━━━━━
🚩 *From:* Swargate, Pune
📍 *To:* Magarpatta City, Pune
🕐 *Time available:* 45 min

🌤️ *Weather:* Partly Cloudy | 28°C

🚗 *Live Traffic*
  • Congestion: *32/100* (LOW)
  • Alert: *GREEN*
  • Mappls: 5.45 km, 11.7 min

🚇 *Nearest Metro:* Swargate (Purple Line) — 0.08 km

🟢 Clear roads! You're good to go.

━━━━━━━━━━━━━━━━━━━━━━━━
🗺️ *TRAVEL ITINERARY*

🚗 *Option A: By Road*
  Distance: ~5.45 km | Time: ~12 min
  🔗 google.com/maps

🚇 *Option B: By Metro*
  Step 1: Walk → Swargate Metro (~1 min)
  Step 2: Purple Line ride → 22 min
  Step 3: Walk to destination (~26 min)
  Total: ~49 min

💡 *Recommended: By Road* — 12 min ✅

_Powered by Tram.AI · Groq AI · Mappls_`,
    },
];

// Render WhatsApp-style markdown (*bold*, _italic_)
function Format({ text }: { text: string }) {
    return (
        <>
            {text.split("\n").map((line, li) => {
                const parts: React.ReactNode[] = [];
                let rem = line;
                let k = 0;
                while (rem.length > 0) {
                    const b = rem.match(/^\*([^*]+)\*/);
                    const it = rem.match(/^_([^_]+)_/);
                    if (b) { parts.push(<strong key={k++} className="font-semibold">{b[1]}</strong>); rem = rem.slice(b[0].length); }
                    else if (it) { parts.push(<em key={k++} className="opacity-70">{it[1]}</em>); rem = rem.slice(it[0].length); }
                    else {
                        const nx = rem.search(/[*_]/);
                        if (nx === -1) { parts.push(<span key={k++}>{rem}</span>); rem = ""; }
                        else { parts.push(<span key={k++}>{rem.slice(0, nx)}</span>); rem = rem.slice(nx); }
                    }
                }
                return <span key={li}>{parts.length ? parts : "\u00A0"}{li < text.split("\n").length - 1 && <br />}</span>;
            })}
        </>
    );
}

// Bouncing dots typing indicator
function Typing() {
    return (
        <div className="flex items-center gap-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-bl-sm w-16 shadow-sm">
            {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.7s" }} />
            ))}
        </div>
    );
}

// Single bubble
function Bubble({ msg, isReport }: { msg: typeof CONVERSATION[0]; isReport?: boolean }) {
    const isUser = msg.role === "user";
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}
        >
            {!isUser && (
                <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-auto mb-0.5 shadow-md">
                    🤖
                </div>
            )}
            <div className={`relative max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm
        ${isUser
                    ? "bg-green-600 text-white rounded-br-sm"
                    : isReport
                        ? "bg-green-50 border border-green-200 text-slate-800 rounded-bl-sm"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                }`}
            >
                {isReport && (
                    <span className="absolute -top-2 left-3 bg-green-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wide">
                        LIVE REPORT
                    </span>
                )}
                <div className={`whitespace-pre-wrap leading-snug ${isReport ? "text-[11px]" : "text-xs"}`}>
                    <Format text={msg.text} />
                </div>
                <div className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1
          ${isUser ? "text-green-100" : "text-slate-400"}`}>
                    {msg.time}
                    {isUser && (
                        <svg className="w-2.5 h-2.5 fill-green-200" viewBox="0 0 16 11">
                            <path d="M11.071.653a.5.5 0 0 0-.707 0L4.975 6.042 2.636 3.702a.5.5 0 0 0-.707.707l2.693 2.693a.5.5 0 0 0 .707 0l5.742-5.742a.5.5 0 0 0 0-.707zm2 0a.5.5 0 0 0-.707 0L7.975 6.042 7.62 5.687a.5.5 0 0 0-.707.707l.708.708a.5.5 0 0 0 .707 0L13.07 1.36a.5.5 0 0 0 0-.707z" />
                        </svg>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export function WhatsAppDashboardWidget() {
    const [count, setCount] = useState(0);
    const [typing, setTyping] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [done, setDone] = useState(false);
    const [started, setStarted] = useState(false);

    // Ref for the scrollable chat container (NOT bottomRef scrollIntoView)
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    // Watch when widget enters viewport — only fire once
    const sectionRef = useRef<HTMLDivElement>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-80px" });

    // Scroll within the chat box only — never touch page scroll
    const scroll = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };

    const play = () => {
        clear();
        setCount(0); setTyping(false); setDone(false); setPlaying(true);

        let t = 400;
        CONVERSATION.forEach((msg, i) => {
            const d = msg.delay ?? 800;
            if (msg.role === "bot") {
                timers.current.push(setTimeout(() => { setTyping(true); scroll(); }, t));
                t += d;
                timers.current.push(setTimeout(() => { setTyping(false); setCount(i + 1); scroll(); }, t));
            } else {
                timers.current.push(setTimeout(() => { setCount(i + 1); scroll(); }, t));
            }
            t += d + 350;
        });
        timers.current.push(setTimeout(() => {
            setPlaying(false);
            setDone(true);
            // Wait 4 seconds then restart loop
            timers.current.push(setTimeout(play, 4000));
        }, t));
    };

    // Start only when scrolled into view, only once
    useEffect(() => {
        if (inView && !started) {
            setStarted(true);
            play();
        }
    }, [inView]);

    // Cleanup on unmount
    useEffect(() => clear, []);

    return (
        <div ref={sectionRef} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Card header — matches dashboard card style */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center text-sm shadow">🤖</div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Tram.AI WhatsApp Bot</p>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${playing ? "bg-green-500 animate-pulse" : done ? "bg-green-500" : "bg-slate-300"}`} />
                            <span className="text-[11px] text-slate-500">
                                {playing ? "Live demo running..." : done ? "Restarting cycle..." : "Starting..."}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Powered-by badges */}
                    <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">
                        Groq AI
                    </span>
                    <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">
                        Mappls
                    </span>
                </div>
            </div>

            {/* Chat area */}
            <div
                ref={chatContainerRef}
                className="relative overflow-y-auto px-4 py-4 flex flex-col gap-2"
                style={{
                    height: 480,
                    scrollbarWidth: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='52' viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%2316a34a' fill-opacity='0.04'%3E%3Cpath d='M26 34.9V26h-8.9v8.9H26zm0-17.8V8.2h-8.9v8.9H26zm17.8 0V8.2h-8.9v8.9h8.9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundColor: "#f9fafb",
                }}
            >
                {/* Date chip */}
                <div className="flex justify-center mb-1">
                    <span className="bg-white border border-slate-200 text-slate-500 text-[10px] px-3 py-1 rounded-full shadow-sm">
                        Today • 05:21 AM
                    </span>
                </div>

                {CONVERSATION.map((msg, i) =>
                    i < count ? <Bubble key={i} msg={msg} isReport={msg.isReport} /> : null
                )}

                <AnimatePresence>
                    {typing && (
                        <motion.div
                            key="typing"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-end gap-2"
                        >
                            <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-xs flex-shrink-0">
                                🤖
                            </div>
                            <Typing />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="h-1" />
            </div>

            {/* Bottom bar mimicking WhatsApp input */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 bg-white">
                <div className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-slate-400 text-xs">
                    {playing ? <span className="text-green-600 animate-pulse">Bot is typing a response...</span> : "Type a message"}
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${playing ? "bg-slate-200" : "bg-green-600"}`}>
                    <svg className={`w-4 h-4 fill-current ${playing ? "text-slate-400" : "text-white"}`} viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </div>
            </div>
        </div >
    );
}
