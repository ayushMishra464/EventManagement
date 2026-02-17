# Event Management — Frontend

React + Vite + TypeScript app with shadcn-style UI (Tailwind + Radix).

## Member attribution

All frontend work is attributed to **Member 6** in file comments (e.g. layout, pages, UI components, API client, types).

## Run

```bash
npm install
npm run dev
```

App: `http://localhost:5173`. API requests are proxied to `http://localhost:8080/api`.

## Build

```bash
npm run build
npm run preview   # preview production build
```

## Structure

- `src/components/ui/` — Button, Card, Input, Label (shadcn-style)
- `src/components/layout/` — Layout with header and nav
- `src/pages/` — Home, Events, Venues, Users
- `src/services/api.ts` — API client for backend
- `src/types/` — TypeScript types
