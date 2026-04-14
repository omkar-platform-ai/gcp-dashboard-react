# GCP Microservices Dashboard

A single-page deployment health dashboard for Google Cloud Run services — built with **React + Vite + TailwindCSS**. Uses realistic mock data; no backend or GCP credentials required.

🔗 **Live demo:** https://omkar-platform-ai.github.io/gcp-dashboard-react/

---

## Features

| Feature | Detail |
|---|---|
| **Service Health Cards** | One card per service with status badge (Healthy / Degraded / Failing), uptime %, instance count, last deploy time, and current revision |
| **CSS Sparkline** | 28-day uptime history rendered as a pure-CSS bar chart — no SVG, no canvas, no chart library |
| **Deployment Timeline** | Chronological table of the last 60 deployments across all services with image tag, deployer email, and status pill |
| **Client-side Filtering** | Filter by service name / image tag text search + status dropdown — zero backend calls |
| **Dark-mode UI** | Glassmorphism cards, gradient header, tabular-nums timestamps, responsive grid |

## Data Model

Mock data lives in `src/data.js` and mirrors the actual GCP Cloud Run + Artifact Registry shape:

```
Service       → name, uri, latestReadyRevision, trafficAllocation
Revision      → containerImage, serviceAccount, executionEnvironment, conditions
Deployment    → revisionName, containerImage, deployerEmail, status, createTime
```

Each service generates **28 days of uptime history** (weighted by health status) for the sparkline, plus **15–40 deployment events** for the timeline.

## Stack

- [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- [TailwindCSS v3](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) — icons only
- GitHub Actions → GitHub Pages (CI/CD)

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
```

## Deploy your own

```bash
npm run build      # outputs to dist/
# drag dist/ to https://app.netlify.com/drop  — or —
# push to GitHub and enable Pages → GitHub Actions source
```

## Architecture

```
src/
├── data.js                  # Mock data generator (Services, Revisions, Deployments)
└── components/
    ├── Dashboard.jsx         # Layout, filter state, timeline table
    └── ServiceHealthCard.jsx # Health card + CSS sparkline + status badge
```
