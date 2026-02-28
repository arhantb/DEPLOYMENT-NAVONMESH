"use client";

import { WhatsAppDashboardWidget } from "@/components/WhatsAppDemo";

export default function WhatsAppDemoPage() {
    return (
        <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-lg">
                <div className="mb-4 flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Feature 3</span>
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-green-700 font-semibold bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        WhatsApp Commute Bot
                    </span>
                </div>
                <WhatsAppDashboardWidget />
            </div>
        </div>
    );
}
