# KeyHaven Render Deployment Setup

## Overview
This project is a Vite + React frontend with an Express backend. On Render it runs as a single web service: the backend serves the built frontend.

## Build & Start Commands
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

## Environment Variables (Render Dashboard)
Set these in your Render service's Environment tab:

| Key | Value | Notes |
|-----|-------|-------|
| `PORT` | (auto) | Render provides this automatically; do not override unless needed |
| `NODE_ENV` | `production` | Enables production mode |
| `RAPIDAPI_KEY` | your RapidAPI key | Optional; falls back to mock data if unset |
| `VITE_API_URL` | (leave empty) | Leave empty so frontend uses same origin as backend |

## Local Development
1. Copy `.env.example` to `.env` and fill values.
2. `npm install`
3. `npm run dev` (starts backend on 3001 and Vite on 5000)

## Notes
- The backend serves the built `dist/` folder and handles SPA routing.
- Health check endpoint: `/health`
- Admin credentials: `admin` / `admin123`
- If `RAPIDAPI_KEY` is not set, the app uses built-in mock property data.