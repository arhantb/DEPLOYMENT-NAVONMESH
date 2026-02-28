# FEATURE-2 — Intelligent Commute Demo (Pune)

This is a small hackathon demo (no Docker/K8s) showcasing a Pune-focused interactive map, a simple commute planner, and a congestion heuristic using real OpenStreetMap data.

Run locally using Next.js dev server (the demo is served from `public/FEATURE-2/index.html`):

```powershell
# from traffic_ai
npm run dev
# open http://localhost:3000/ and navigate to the landing page — the iframe loads /FEATURE-2/index.html
```

Or run a static server inside the original FEATURE-2 folder:

```powershell
cd FEATURE-2
python -m http.server 8000
# open http://localhost:8000
```

Notes
- The demo uses public Overpass, Nominatim and OSRM endpoints and is Pune-limited by bbox.
