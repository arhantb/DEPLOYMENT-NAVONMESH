"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Train,
  Cloud,
  AlertTriangle,
  TrendingUp,
  Users,
  Navigation,
  ExternalLink,
  Calendar,
  Zap,
  ChevronRight,
  Thermometer,
  Wind,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImpactZone {
  range: string;
  level: number;
  roads: string;
}

interface MetroInfo {
  name: string;
  distanceKm: number;
  walkMin: number;
  autoMin: number;
}

interface WeatherInfo {
  condition: string;
  tempC: number;
  humidity: number;
  windKmh: number;
  icon: "clear" | "clouds" | "rain" | "haze";
}

interface EventInfo {
  name: string;
  date: string;
  attendance: number;
  details?: string;
}

interface VenueResult {
  name: string;
  type: string;
  capacity: number;
  lat: number;
  lng: number;
  event: EventInfo | null;
  congestionIndex: number;
  confidence: number;
  impactZones: ImpactZone[];
  metro: MetroInfo;
  weather: WeatherInfo;
  mapsUrl: string;
}

const VENUE_DB: Record<string, VenueResult> = {
  "pict pune": {
    name: "Pune Institute of Computer Technology",
    type: "College",
    capacity: 3000,
    lat: 18.4574,
    lng: 73.8497,
    event: null,
    congestionIndex: 10,
    confidence: 60,
    impactZones: [
      { range: "0–500m", level: 0, roads: "Pune–Satara Road" },
      { range: "500m–2km", level: 0, roads: "Bibwewadi Road, Katraj–Kondhwa Road" },
    ],
    metro: { name: "Katraj Station", distanceKm: 4.72, walkMin: 59, autoMin: 9 },
    weather: { condition: "Few Clouds", tempC: 24, humidity: 48, windKmh: 12, icon: "clouds" },
    mapsUrl: "https://maps.google.com/?q=Pune+Institute+of+Computer+Technology",
  },
  "shivajinagar": {
    name: "Shivajinagar Bus Stand",
    type: "Transit Hub",
    capacity: 15000,
    lat: 18.5302,
    lng: 73.8478,
    event: { name: "Evening Rush", date: "22 February 2026", attendance: 8000 },
    congestionIndex: 82,
    confidence: 91,
    impactZones: [
      { range: "0–500m", level: 3, roads: "FC Road, JM Road" },
      { range: "500m–2km", level: 2, roads: "SB Road, Bhandarkar Road" },
    ],
    metro: { name: "Shivajinagar Metro", distanceKm: 0.3, walkMin: 4, autoMin: 2 },
    weather: { condition: "Clear Sky", tempC: 27, humidity: 38, windKmh: 8, icon: "clear" },
    mapsUrl: "https://maps.google.com/?q=Shivajinagar+Bus+Stand+Pune",
  },
  "hinjewadi": {
    name: "Hinjewadi IT Park Phase 1",
    type: "IT Campus",
    capacity: 40000,
    lat: 18.5986,
    lng: 73.7366,
    event: { name: "Weekday Peak Inflow", date: "22 February 2026", attendance: 35000 },
    congestionIndex: 88,
    confidence: 95,
    impactZones: [
      { range: "0–500m", level: 3, roads: "Hinjewadi–Wakad Road" },
      { range: "500m–2km", level: 3, roads: "Baner Road, Aundh–Ravet BRTS" },
      { range: "2km–5km", level: 2, roads: "Mumbai–Pune Expressway Feeder" },
    ],
    metro: { name: "Hinjewadi Phase 1 Metro", distanceKm: 0.8, walkMin: 10, autoMin: 3 },
    weather: { condition: "Hazy", tempC: 26, humidity: 55, windKmh: 6, icon: "haze" },
    mapsUrl: "https://maps.google.com/?q=Hinjewadi+IT+Park+Pune",
  },
  "swargate": {
    name: "Swargate Bus Terminal",
    type: "Transit Hub",
    capacity: 12000,
    lat: 18.5018,
    lng: 73.8636,
    event: { name: "Afternoon Peak", date: "22 February 2026", attendance: 6500 },
    congestionIndex: 74,
    confidence: 87,
    impactZones: [
      { range: "0–500m", level: 3, roads: "Pune–Satara Road, Tilak Road" },
      { range: "500m–2km", level: 2, roads: "Market Yard Road, Parvati Road" },
    ],
    metro: { name: "Swargate Metro", distanceKm: 0.2, walkMin: 3, autoMin: 1 },
    weather: { condition: "Partly Cloudy", tempC: 25, humidity: 52, windKmh: 10, icon: "clouds" },
    mapsUrl: "https://maps.google.com/?q=Swargate+Bus+Terminal+Pune",
  },
};

function fuzzyMatch(query: string): VenueResult | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  // If it's something totally different than our small static list, don't match just on "pune"
  for (const key of Object.keys(VENUE_DB)) {
    if (key === q) return VENUE_DB[key];
  }
  // Avoid matching on common words like "pune" unless explicitly requested
  const commonKeywords = ["pune", "college", "stadium"];
  for (const key of Object.keys(VENUE_DB)) {
    const words = q.split(" ");
    if (words.some((w) => w.length > 3 && !commonKeywords.includes(w) && key.includes(w))) return VENUE_DB[key];
  }
  return null;
}

const levelColors: Record<number, { bg: string; text: string; label: string; bar: string }> = {
  0: { bg: "bg-green-50", text: "text-green-700", label: "Clear", bar: "bg-green-500" },
  1: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Moderate", bar: "bg-yellow-400" },
  2: { bg: "bg-orange-50", text: "text-orange-700", label: "Heavy", bar: "bg-orange-500" },
  3: { bg: "bg-red-50", text: "text-red-700", label: "Severe", bar: "bg-red-500" },
};

function WeatherIcon({ icon }: { icon: WeatherInfo["icon"] }) {
  if (icon === "clear") return <span className="text-2xl">☀️</span>;
  if (icon === "rain") return <span className="text-2xl">🌧️</span>;
  if (icon === "haze") return <span className="text-2xl">🌫️</span>;
  return <span className="text-2xl">⛅</span>;
}

function CongestionGauge({ value }: { value: number }) {
  const color =
    value >= 75 ? "text-red-600" : value >= 50 ? "text-orange-500" : value >= 25 ? "text-yellow-500" : "text-green-600";
  const barColor =
    value >= 75 ? "bg-red-500" : value >= 50 ? "bg-orange-400" : value >= 25 ? "bg-yellow-400" : "bg-green-500";
  const label =
    value >= 75 ? "Severe" : value >= 50 ? "Heavy" : value >= 25 ? "Moderate" : "Clear";

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <span className={cn("text-4xl font-black tracking-tighter", color)}>{value}</span>
        <span className={cn("text-xs font-bold uppercase tracking-widest mb-1 px-2 py-0.5 rounded-full", color,
          value >= 75 ? "bg-red-50" : value >= 50 ? "bg-orange-50" : value >= 25 ? "bg-yellow-50" : "bg-green-50"
        )}>{label}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", barColor)}
        />
      </div>
      <p className="text-[10px] text-slate-400 font-medium">0 = free flow · 100 = gridlock</p>
    </div>
  );
}

export function VenueTrafficAnalyzer() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<VenueResult | null>(null);
  const [decision, setDecision] = useState<any>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venue: query }),
      });

      if (!res.ok) throw new Error(`Backend error ${res.status}`);

      const fullData = await res.json();
      const data = fullData.analysis;
      const aiDecision = fullData.decision;
      setDecision(aiDecision);

      // Map backend response to the VenueResult shape used by the UI.
      const mapped: VenueResult = {
        name:
          data?.venue?.name || data?.venue_query || data?.name || query || "Unknown Venue",
        type: data?.venue?.type || "Venue",
        capacity: (() => {
          const cap = data?.venue?.capacity || data?.venue?.capacity_text || data?.capacity || 0;
          if (typeof cap === "number") return cap;
          if (typeof cap === "string") return parseInt(cap.replace(/[^0-9]/g, "")) || 0;
          return 0;
        })(),
        lat: data?.location?.latitude || data?.venue?.lat || data?.lat || 0,
        lng: data?.location?.longitude || data?.venue?.lng || data?.lon || data?.lng || 0,
        event: data?.event_context
          ? {
            name: data.event_context?.likely_event_today || data.event_context?.name || "No event detected",
            date: data.event_context?.date || data.event_context?.day_of_week || "",
            attendance: parseInt(data.event_context?.estimated_attendance) || 0,
            details: data.event_context?.specific_details || data.event_context?.details || ""
          }
          : null,
        congestionIndex:
          (() => {
            const raw = data?.traffic_prediction?.congestion_index ?? 0;
            if (typeof raw === "number") return raw;
            const parsed = parseInt(String(raw).replace(/[^0-9]/g, ""));
            return isNaN(parsed) ? 10 : parsed; // fallback to 10 if string like "Unknown"
          })(),
        confidence:
          (() => {
            const raw = data?.traffic_prediction?.confidence ?? 0;
            if (typeof raw === "number") return raw;
            const parsed = parseInt(String(raw).replace(/[^0-9]/g, ""));
            return isNaN(parsed) ? 50 : parsed;
          })(),
        impactZones: (() => {
          const raw = data?.impact_zones;
          if (Array.isArray(raw)) return raw.map((z: any) => ({
            range: z.range || z.radius || "0–500m",
            level: z.level ?? z.severity ?? 0,
            roads: z.roads_affected || z.roads || (Array.isArray(z.roads) ? z.roads.join(", ") : ""),
          }));
          if (raw && typeof raw === "object") return [{
            range: raw.radius || "0\u20132km",
            level: raw.level ?? 1,
            roads: Array.isArray(raw.roads_affected) ? raw.roads_affected.join(", ") : (raw.roads_affected || ""),
          }];
          return [];
        })(),
        metro: {
          name: data?.nearest_metro_station?.station_name || data?.nearest_metro_station?.name || "None",
          distanceKm: data?.nearest_metro_station?.distance_km || 0,
          walkMin: data?.nearest_metro_station?.walk_min || Math.round((data?.nearest_metro_station?.distance_km || 0) * 12) || 0,
          autoMin: data?.nearest_metro_station?.auto_min || Math.round((data?.nearest_metro_station?.distance_km || 0) * 3) || 0,
        },
        weather: {
          condition: data?.weather?.condition || "Unknown",
          tempC: data?.weather?.temperature_c || 0,
          humidity: data?.weather?.humidity || 0,
          windKmh: data?.weather?.wind_kmh || 0,
          icon: (data?.weather?.icon as any) || "clear",
        },
        mapsUrl: data?.venue?.maps_url || `https://maps.google.com/?q=${encodeURIComponent(query)}`,
      };

      setResult(mapped);
    } catch (err) {
      console.error("Backend failed, using fuzzy match:", err);
      setResult(fuzzyMatch(query));
      setDecision(null);
    } finally {
      setSearched(true);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAnalyze();
  };

  return (
    <div className="w-full space-y-8">
      {/* Search Bar */}
      <div className="flex gap-3 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. PICT Pune, Hinjewadi, Swargate..."
            className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAnalyze}
          disabled={loading}
          className="px-7 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-sm shadow-lg transition-all uppercase tracking-widest disabled:opacity-60"
        >
          {loading ? "..." : "Analyze"}
        </motion.button>
      </div>

      {/* Suggestions */}
      {!searched && (
        <div className="flex flex-wrap gap-2 justify-center">
          {["PICT Pune", "Hinjewadi", "Swargate", "Shivajinagar"].map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); }}
              className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {searched && (
          <motion.div
            key={result?.name || "no-result"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {!result ? (
              <div className="text-center py-16 space-y-3">
                <div className="text-4xl">🔍</div>
                <p className="text-slate-500 font-medium">No venue found for <span className="font-bold text-slate-700">"{query}"</span></p>
                <p className="text-xs text-slate-400">Try: PICT Pune, Hinjewadi, Swargate, or Shivajinagar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* LEFT: Venue Identity + Event */}
                <div className="space-y-4">
                  {/* Venue Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">{result.type}</p>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">{result.name}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 bg-green-50 border border-green-100 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Live</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold">Capacity:</span>
                      <span className="font-black text-slate-900">{result.capacity.toLocaleString()}</span>
                    </div>

                    <a
                      href={result.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 transition-colors"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      View on Google Maps
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Event Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Event Today</p>
                    </div>
                    {result.event ? (
                      <div className="space-y-2">
                        <p className="text-base font-black text-slate-900">{result.event.name}</p>
                        <p className="text-xs text-slate-500">{result.event.date}</p>

                        {result.event.details && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Live Insights</p>
                            <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                              {result.event.details}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-orange-50 border border-orange-100 rounded-xl">
                          <Users className="h-3.5 w-3.5 text-orange-500" />
                          <span className="text-xs font-bold text-orange-700">
                            Est. attendance: {result.event.attendance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-base font-black text-slate-400">No Events</p>
                        <p className="text-xs text-slate-400">22 February 2026 · Est. attendance: 0</p>
                      </div>
                    )}
                  </div>

                  {/* Weather Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Cloud className="h-4 w-4 text-green-600" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Weather</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <WeatherIcon icon={result.weather.icon} />
                      <div>
                        <p className="font-black text-slate-900">{result.weather.condition}</p>
                        <p className="text-xs text-slate-500">{result.weather.tempC}°C · {result.weather.humidity}% humidity</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Wind className="h-3 w-3" />
                        {result.weather.windKmh} km/h
                      </span>
                      <span className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3" />
                        {result.weather.tempC}°C
                      </span>
                    </div>
                  </div>
                </div>

                {/* MIDDLE: Traffic Prediction */}
                <div className="space-y-4">
                  {/* Congestion Index */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Traffic Prediction</p>
                    </div>
                    <CongestionGauge value={result.congestionIndex} />
                    <div className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <Zap className="h-3.5 w-3.5 text-green-600" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Confidence</p>
                        <p className="text-sm font-black text-slate-900">{result.confidence}%</p>
                      </div>
                      <div className="ml-auto h-8 w-8 rounded-full flex items-center justify-center"
                        style={{
                          background: `conic-gradient(#16a34a ${result.confidence * 3.6}deg, #e2e8f0 0deg)`
                        }}
                      >
                        <div className="h-5 w-5 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* Impact Zones */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Impact Zones</p>
                    </div>
                    <div className="space-y-3">
                      {result.impactZones.map((zone, i) => {
                        const c = levelColors[zone.level];
                        return (
                          <div key={i} className={cn("rounded-xl p-3 border", c.bg,
                            zone.level === 0 ? "border-green-100" :
                              zone.level === 1 ? "border-yellow-100" :
                                zone.level === 2 ? "border-orange-100" : "border-red-100"
                          )}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{zone.range}</span>
                              <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", c.text,
                                zone.level === 0 ? "bg-green-100" :
                                  zone.level === 1 ? "bg-yellow-100" :
                                    zone.level === 2 ? "bg-orange-100" : "bg-red-100"
                              )}>
                                Level {zone.level} · {c.label}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700">{zone.roads}</p>
                            <div className="mt-2 h-1 w-full rounded-full bg-white/60">
                              <div className={cn("h-1 rounded-full", c.bar)} style={{ width: `${(zone.level / 3) * 100}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Metro + Recommendations */}
                <div className="space-y-4">
                  {/* Nearest Metro */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Train className="h-4 w-4 text-green-600" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Nearest Metro</p>
                    </div>
                    <p className="text-base font-black text-slate-900 mb-1">{result.metro.name}</p>
                    <p className="text-xs text-slate-500 mb-4">{result.metro.distanceKm} km away</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: "🚶", label: "Walk", val: `${result.metro.walkMin} min` },
                        { icon: "🛺", label: "Auto", val: `${result.metro.autoMin} min` },
                      ].map((t) => (
                        <div key={t.label} className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-base">{t.icon}</span>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.label}</p>
                            <p className="text-sm font-black text-slate-900">{t.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(result.metro.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Get Directions
                      <ChevronRight className="h-3 w-3" />
                    </a>
                  </div>

                  {/* AI Recommendations */}
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="h-4 w-4 text-green-600" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-700">AI Recommendations</p>
                    </div>
                    {decision ? (
                      <div className="space-y-4">
                        <p className="text-xs font-bold text-green-900 leading-relaxed italic">
                          "{decision.decision_summary}"
                        </p>
                        <ul className="space-y-2.5">
                          {(decision.traffic_management_actions || []).slice(0, 3).map((action: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-green-800 font-medium">
                              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-green-600 text-white flex items-center justify-center text-[9px] font-black">{idx + 1}</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                        {decision.public_advisories?.length > 0 && (
                          <div className="pt-3 border-t border-green-200/50">
                            <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Public Advisory</p>
                            <p className="text-[10px] text-green-700 font-semibold">{decision.public_advisories[0]}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <ul className="space-y-2.5">
                        {result.congestionIndex >= 75 ? (
                          <>
                            <li className="flex items-start gap-2 text-xs text-green-800 font-medium">
                              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-green-600 text-white flex items-center justify-center text-[9px] font-black">1</span>
                              Avoid peak hours 8–10 AM and 6–8 PM
                            </li>
                            <li className="flex items-start gap-2 text-xs text-green-800 font-medium">
                              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-green-600 text-white flex items-center justify-center text-[9px] font-black">2</span>
                              Use metro — significant time savings expected
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start gap-2 text-xs text-green-800 font-medium">
                              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-green-600 text-white flex items-center justify-center text-[9px] font-black">1</span>
                              Roads are clear — good time to travel
                            </li>
                            <li className="flex items-start gap-2 text-xs text-green-800 font-medium">
                              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-green-600 text-white flex items-center justify-center text-[9px] font-black">2</span>
                              No significant delays expected today
                            </li>
                          </>
                        )}
                      </ul>
                    )}
                  </div>

                  {/* Coordinates */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Coordinates</p>
                    </div>
                    <p className="text-xs font-mono text-slate-600">
                      {result.lat.toFixed(4)}°N, {result.lng.toFixed(4)}°E
                    </p>
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
