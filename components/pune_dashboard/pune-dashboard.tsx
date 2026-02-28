"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import Navbar from "@/components/navbar";
import { PuneDashboardHeader } from "@/components/pune_dashboard/header";
import { PuneSummaryCards } from "@/components/pune_dashboard/summary-cards";
import { PuneCongestedArterials } from "@/components/pune_dashboard/congested-arterials";
const PuneHotspotsMap = dynamic(
  () => import("@/components/pune_dashboard/hotspots-map").then((mod) => mod.PuneHotspotsMap),
  { ssr: false }
);
import { PuneDailyTrends } from "@/components/pune_dashboard/daily-trends";
import { PuneHourlyTrends } from "@/components/pune_dashboard/hourly-trends";
import { Sidebar } from "../ui/sidebar";
import { WhatsAppDashboardWidget } from "@/components/WhatsAppDemo";
import { motion } from "framer-motion";

export function PuneDashboard() {
  const [location, setLocation] = useState("Pune Metro Region");
  const [reportingPeriod, setReportingPeriod] = useState("Last Two Weeks");
  const [comparisonPeriod, setComparisonPeriod] = useState("Baseline");

  const subtitle = useMemo(() => {
    return `${location} • ${reportingPeriod} vs ${comparisonPeriod}`;
  }, [location, reportingPeriod, comparisonPeriod]);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-950 overflow-x-hidden selection:bg-green-100 selection:text-green-900">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="pt-20"
      >
        {/* Hero Banner — matches landing page style */}
        <section className="relative overflow-hidden bg-[#f7f8fa] border-b border-slate-200/60 px-6 lg:px-16 py-10">
          <div className="absolute inset-y-0 right-0 w-full lg:w-[55%] bg-gradient-to-l from-[#e5e6e8] via-[#f1f2f4] to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="space-y-4 max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live Traffic Intelligence
              </div>
              <h1 className="text-3xl lg:text-4xl font-black leading-tight text-slate-900 tracking-tight">
                Pune Metro Region
                <span className="text-green-600"> Traffic Dashboard</span>
              </h1>
              <p className="text-sm lg:text-base text-slate-600 font-medium leading-relaxed">
                Real-time congestion analytics, incident monitoring and signal optimization across Pune's key corridors and junctions.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-6">
          <PuneDashboardHeader
            location={location}
            setLocation={setLocation}
            reportingPeriod={reportingPeriod}
            setReportingPeriod={setReportingPeriod}
            comparisonPeriod={comparisonPeriod}
            setComparisonPeriod={setComparisonPeriod}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600 font-medium">
              {subtitle}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs text-slate-700 backdrop-blur shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Green: improved flow
              <span className="ml-2 h-1.5 w-1.5 rounded-full bg-orange-400" />
              Orange: increased pressure
            </div>
          </div>

          <div className="mt-5">
            <PuneSummaryCards />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <PuneCongestedArterials />
            <PuneHotspotsMap />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <PuneDailyTrends />
            <PuneHourlyTrends />
          </div>

          {/* Feature 3 — WhatsApp Commute Bot Demo */}
          <div className="mt-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Feature 3</span>
              <span className="h-px flex-1 bg-slate-200" />
              <span className="inline-flex items-center gap-1.5 text-[11px] text-green-700 font-semibold bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                WhatsApp Commute Bot · Live
              </span>
            </div>
            <WhatsAppDashboardWidget />
          </div>

          <div className="pb-10" />
        </div>
      </motion.div>
    </div>
  );
}
