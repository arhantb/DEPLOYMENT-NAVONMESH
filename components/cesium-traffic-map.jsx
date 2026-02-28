"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── City configuration ───────────────────────────────────────────────────────
const CITIES = {
  pune: {
    id: "pune",
    label: "Pune",
    lon: 73.8567,
    lat: 18.5204,
    altitude: 80000,
    bbox: "18.40,73.72,18.65,73.99",
    color: "#10b981",
    stats: { junctions: 312, delay: "31%", incidents: 7, avgSpeed: "28 km/h" },
  },
  mumbai: {
    id: "mumbai",
    label: "Mumbai",
    lon: 72.8777,
    lat: 19.076,
    altitude: 80000,
    bbox: "18.89,72.77,19.27,72.99",
    color: "#f59e0b",
    stats: { junctions: 489, delay: "38%", incidents: 14, avgSpeed: "22 km/h" },
  },
  delhi: {
    id: "delhi",
    label: "Delhi",
    lon: 77.1025,
    lat: 28.7041,
    altitude: 80000,
    bbox: "28.40,76.84,28.88,77.35",
    color: "#ef4444",
    stats: { junctions: 621, delay: "42%", incidents: 19, avgSpeed: "19 km/h" },
  },
  bengaluru: {
    id: "bengaluru",
    label: "Bengaluru",
    lon: 77.5946,
    lat: 12.9716,
    altitude: 80000,
    bbox: "12.83,77.46,13.14,77.74",
    color: "#6366f1",
    stats: { junctions: 278, delay: "29%", incidents: 5, avgSpeed: "32 km/h" },
  },
};

// ─── Road color helpers ───────────────────────────────────────────────────────
const getColorHex = (highway) => {
  if (highway.startsWith("motorway") || highway.startsWith("trunk")) return "#ff6b6b";
  if (highway.startsWith("primary")) return "#ffd93d";
  return "#4ecdc4";
};

const getWidth = (highway) => {
  if (highway.startsWith("motorway") || highway.startsWith("trunk")) return 4;
  if (highway.startsWith("primary")) return 3;
  return 1.5;
};

const CESIUM_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTNmNDEyNi0yNDNiLTQxYmQtYTkyMi04ZTU4OTk4ZGNiYzkiLCJpZCI6Mzk1MTgzLCJpYXQiOjE3NzIxNjg5NjB9.5LOFT4eVXhwhQht3eIW7KtyAQ4sdZvEdtCnFphwwYdQ";

// ─── Main Component ──────────────────────────────────────────────────────────
export function CesiumTrafficMap() {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const routeEntitiesRef = useRef([]);
  const cityMarkersRef = useRef([]);
  const animFrameRef = useRef(null);

  const [activeCity, setActiveCity] = useState("pune");
  const [loading, setLoading] = useState(false);
  const [routeCount, setRouteCount] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [cesiumReady, setCesiumReady] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [trafficPulse, setTrafficPulse] = useState(true);
  const [viewMode, setViewMode] = useState("street"); // street | satellite | night

  // ── Load Cesium script ────────────────────────────────────────────────────
  useEffect(() => {
    if (window.Cesium) { setCesiumReady(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cesium.com/downloads/cesiumjs/releases/1.111/Build/Cesium/Widgets/widgets.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cesium.com/downloads/cesiumjs/releases/1.111/Build/Cesium/Cesium.js";
    script.async = true;
    script.onload = () => setCesiumReady(true);
    document.head.appendChild(script);
  }, []);

  // ── Init viewer ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!cesiumReady || !containerRef.current || viewerRef.current) return;
    const Cesium = window.Cesium;
    Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      geocoder: false,
      homeButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      creditContainer: document.createElement("div"),
    });

    viewer.scene.screenSpaceCameraController.inertiaSpin = 0.7;
    viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.7;
    viewer.scene.screenSpaceCameraController.inertiaZoom = 0.7;

    // Night-like atmosphere
    viewer.scene.globe.enableLighting = true;
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#0a0f1a");

    viewerRef.current = viewer;

    // Add Cesium ion imagery provider for improved basemap (async)
    (async () => {
      try {
        const imagery = await Cesium.IonImageryProvider.fromAssetId(4);
        // replace default imagery with ion imagery
        viewer.imageryLayers.removeAll();
        viewer.imageryLayers.addImageryProvider(imagery);
      } catch (err) {
        console.warn('Could not load Ion imagery provider, using default.', err);
      }
    })();

    // Fly to India
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(78.9629, 22.5937, 3200000),
      duration: 2.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    });

    // Add all city markers
    Object.values(CITIES).forEach((city) => {
      const entity = viewer.entities.add({
        name: city.label,
        position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat),
        point: {
          pixelSize: 14,
          color: Cesium.Color.fromCssColorString(city.color),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2.5,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          scaleByDistance: new Cesium.NearFarScalar(1.5e3, 2.5, 8.0e6, 0.7),
        },
        label: {
          text: city.label,
          font: "600 13px 'DM Sans', sans-serif",
          pixelOffset: new Cesium.Cartesian2(0, -26),
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString("#0a0f1a"),
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          scaleByDistance: new Cesium.NearFarScalar(1.5e3, 1.8, 8.0e6, 0.5),
          translucencyByDistance: new Cesium.NearFarScalar(8.0e6, 1.0, 2.0e7, 0.0),
        },
      });
      cityMarkersRef.current.push(entity);
    });

    // Click handler
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click) => {
      const picked = viewer.scene.pick(click.position);
      if (picked && picked.id) {
        const name = picked.id.name;
        const city = Object.values(CITIES).find((c) => c.label === name);
        if (city) {
          setActiveCity(city.id);
          flyToCity(city, viewer);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [cesiumReady]);

  // ── Fly to city ───────────────────────────────────────────────────────────
  const flyToCity = useCallback((city, viewer) => {
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(city.lon, city.lat, city.altitude),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0,
      },
      duration: 2.2,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    });
  }, []);

  // ── Load routes ───────────────────────────────────────────────────────────
  const loadRoutes = useCallback(async (cityId) => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    setLoading(true);
    setRouteCount(0);

    // Remove old route entities
    routeEntitiesRef.current.forEach((e) => viewer.entities.remove(e));
    routeEntitiesRef.current = [];

    const city = CITIES[cityId];
    flyToCity(city, viewer);

    const query = `
[out:json][timeout:60];
(
  way["highway"~"^(motorway|motorway_link|trunk|trunk_link)$"](${city.bbox});
  way["highway"~"^(primary|primary_link)$"](${city.bbox});
  way["highway"~"^(secondary|secondary_link)$"](${city.bbox});
);
out body;
>;
out skel qt;`.trim();

    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
      });
      const data = await res.json();

      const nodeMap = {};
      data.elements.forEach((el) => { if (el.type === "node") nodeMap[el.id] = el; });

      // remove previous route entities
      routeEntitiesRef.current.forEach((e) => viewer.entities.remove(e));
      routeEntitiesRef.current = [];

      let count = 0;
      const signals = [];

      data.elements.forEach((el) => {
        // ways: roads
        if (el.type === "way" && el.tags?.highway) {
          const coords = [];
          (el.nodes || []).forEach((id) => {
            const n = nodeMap[id];
            if (n) coords.push(n.lon, n.lat);
          });
          if (coords.length < 4) return;

          const colorHex = getColorHex(el.tags.highway);
          const entity = viewer.entities.add({
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray(coords),
              width: getWidth(el.tags.highway),
              material: new Cesium.ColorMaterialProperty(
                Cesium.Color.fromCssColorString(colorHex).withAlpha(0.95)
              ),
              clampToGround: true,
            },
            properties: {
              name: el.tags.name || "Unnamed road",
              highway: el.tags.highway,
              lanes: el.tags.lanes || "N/A",
              maxspeed: el.tags.maxspeed || "N/A",
            },
          });
          routeEntitiesRef.current.push(entity);
          count++;
        }

        // nodes: traffic signals and bus stops
        if (el.type === "node" && el.tags) {
          if (el.tags.highway === "traffic_signals") {
            signals.push({ lat: el.lat, lon: el.lon, tags: el.tags });
            viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(el.lon, el.lat, 0),
              point: { pixelSize: 6, color: Cesium.Color.fromCssColorString("#ff4444"), heightReference: Cesium.HeightReference.CLAMP_TO_GROUND },
              properties: { type: "signal", name: el.tags.name || "Signal" },
            });
          }
          if (el.tags.highway === "bus_stop") {
            viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(el.lon, el.lat, 0),
              point: { pixelSize: 4, color: Cesium.Color.fromCssColorString("#ffd166"), heightReference: Cesium.HeightReference.CLAMP_TO_GROUND },
              properties: { type: "bus_stop", name: el.tags.name || "Bus Stop" },
            });
          }
        }
      });

      // store signals for later heuristics
      viewerRef.current._signals = signals;

      setRouteCount(count);

      // fit camera to loaded routes (safe subset)
      try {
        if (routeEntitiesRef.current.length > 0) viewer.zoomTo(routeEntitiesRef.current.slice(0, 200));
        else viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(city.lon, city.lat, city.altitude), duration: 1.2 });
      } catch (e) {
        console.warn('zoomTo error', e);
      }
    } catch (err) {
      console.error("Overpass error:", err);
    } finally {
      setLoading(false);
    }
  }, [flyToCity]);

  // ── Switch city ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (cesiumReady && viewerRef.current) loadRoutes(activeCity);
  }, [activeCity, cesiumReady]);

  // ── View mode ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;
    if (!viewer || !Cesium) return;

    if (viewMode === "night") {
      viewer.scene.globe.enableLighting = true;
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#000814");
    } else {
      viewer.scene.globe.enableLighting = false;
    }
  }, [viewMode]);

  const city = CITIES[activeCity];

  // Planner moved to FEATURE-2/index.html and will be embedded as a separate tile.

  return (
    <section className="relative w-full py-24 px-4 bg-[#060b14] overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-900/40 border border-green-700/50 text-green-400 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Live Road Network Visualization
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
            City Road Intelligence
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto font-medium">
            Real OpenStreetMap road data rendered in 3D. Click a city or marker to
            explore its traffic network.
          </p>
        </motion.div>

        {/* City Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {Object.values(CITIES).map((c) => (
            <motion.button
              key={c.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCity(c.id)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border ${
                activeCity === c.id
                  ? "text-white border-transparent shadow-lg"
                  : "text-slate-400 border-slate-700 bg-slate-900/60 hover:border-slate-500"
              }`}
              style={
                activeCity === c.id
                  ? { background: c.color, boxShadow: `0 0 24px ${c.color}55` }
                  : {}
              }
            >
              {activeCity === c.id && loading && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-ping" />
              )}
              {c.label}
            </motion.button>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-5">
          {/* Cesium Container */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl"
            style={{ height: 540 }}>
            <div ref={containerRef} className="absolute inset-0" />

            {/* Loading Overlay */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#060b14]/80 backdrop-blur-sm flex flex-col items-center justify-center z-20"
                >
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-green-500/30" />
                    <div className="absolute inset-0 rounded-full border-t-2 border-green-400 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-t-2 border-green-300 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
                  </div>
                  <p className="text-green-400 font-bold text-sm tracking-widest uppercase">Fetching road network…</p>
                  <p className="text-slate-500 text-xs mt-1">{city.label} · OpenStreetMap data</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cesium loading state */}
            {!cesiumReady && (
              <div className="absolute inset-0 bg-[#060b14] flex items-center justify-center z-20">
                <p className="text-slate-400 text-sm animate-pulse">Loading 3D engine…</p>
              </div>
            )}

            {/* Top controls bar */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
              {/* Route badge */}
              <div className="pointer-events-auto flex items-center gap-2 px-3 py-2 bg-[#060b14]/90 backdrop-blur rounded-xl border border-slate-700/60">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-xs font-bold">{routeCount || "—"} road segments</span>
              </div>

              {/* View mode buttons */}
              <div className="pointer-events-auto flex gap-1 p-1 bg-[#060b14]/90 backdrop-blur rounded-xl border border-slate-700/60">
                {[
                  { id: "street", label: "Day" },
                  { id: "night", label: "Night" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setViewMode(m.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewMode === m.id
                        ? "bg-green-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <AnimatePresence>
              {showLegend && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute bottom-4 left-4 z-10 bg-[#060b14]/90 backdrop-blur rounded-xl border border-slate-700/60 p-3 space-y-2"
                >
                  <p className="text-slate-400 text-[9px] uppercase tracking-widest font-bold mb-1">Road Type</p>
                  {[
                    { label: "Motorway / Trunk", color: "#ff6b6b" },
                    { label: "Primary", color: "#ffd93d" },
                    { label: "Secondary", color: "#4ecdc4" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-2">
                      <div className="w-6 h-1.5 rounded-full" style={{ background: l.color }} />
                      <span className="text-slate-300 text-[10px] font-medium">{l.label}</span>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowLegend(false)}
                    className="text-slate-600 text-[9px] hover:text-slate-400 mt-1"
                  >
                    Hide
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!showLegend && (
              <button
                onClick={() => setShowLegend(true)}
                className="absolute bottom-4 left-4 z-10 px-2 py-1 bg-[#060b14]/90 backdrop-blur rounded-lg border border-slate-700/60 text-slate-400 text-[9px] hover:text-white"
              >
                Legend
              </button>
            )}

            {/* Tip */}
            <div className="absolute bottom-4 right-4 z-10 text-slate-600 text-[9px] font-medium">
              Click markers to explore cities
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* City Stats Card */}
            <motion.div
              key={activeCity}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 backdrop-blur"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: city.color, boxShadow: `0 0 12px ${city.color}` }}
                />
                <div>
                  <h3 className="text-white font-black text-lg leading-none">{city.label}</h3>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest">Live Traffic Data</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Junctions", value: city.stats.junctions, unit: "" },
                  { label: "Delay Reduction", value: city.stats.delay, unit: "" },
                  { label: "Incidents", value: city.stats.incidents, unit: "" },
                  { label: "Avg Speed", value: city.stats.avgSpeed, unit: "" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/40"
                  >
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">{stat.label}</p>
                    <p className="text-white font-black text-xl leading-none" style={{ color: city.color }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Road breakdown */}
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 backdrop-blur">
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-3">Network Breakdown</p>
              {[
                { type: "Motorway / Trunk", pct: 15, color: "#ff6b6b" },
                { type: "Primary Roads", pct: 28, color: "#ffd93d" },
                { type: "Secondary Roads", pct: 57, color: "#4ecdc4" },
              ].map((r) => (
                <div key={r.type} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 font-medium">{r.type}</span>
                    <span className="font-bold" style={{ color: r.color }}>{r.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.pct}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: r.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Traffic Pulse Toggle */}
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-sm">AI Signal Sync</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">Real-time optimization active</p>
                </div>
                <button
                  onClick={() => setTrafficPulse((p) => !p)}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${trafficPulse ? "bg-green-500" : "bg-slate-700"}`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${trafficPulse ? "left-5.5 translate-x-0.5" : "left-0.5"}`}
                    style={{ left: trafficPulse ? "calc(100% - 22px)" : "2px" }}
                  />
                </button>
              </div>
              <div className={`mt-3 flex items-center gap-2 text-xs ${trafficPulse ? "text-green-400" : "text-slate-600"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${trafficPulse ? "bg-green-400 animate-pulse" : "bg-slate-600"}`} />
                {trafficPulse ? "Optimizing 312 signals…" : "Paused"}
              </div>
            </div>

            {/* Quick City Jump */}
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 backdrop-blur">
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-3">Quick Jump</p>
              <div className="space-y-2">
                {Object.values(CITIES).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCity(c.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      activeCity === c.id
                        ? "bg-slate-800 text-white border border-slate-600"
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    {c.label}
                    <span className="ml-auto text-[10px] text-slate-600 font-mono">
                      {c.stats.junctions} jncts
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
