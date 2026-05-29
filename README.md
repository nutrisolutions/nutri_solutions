# Nutri Solutions Private Limited - MERN SaaS Website

A fresh, modern MERN-stack marketing website inspired by the service scope in `Website/`, rebuilt with a new trendy SaaS layout, animated hero, and interactive scroll behavior.

## Tech Stack
- **Frontend:** React + Vite + Framer Motion + Axios
- **Backend:** Node.js + Express + Mongoose
- **Database:** MongoDB

## Included Features
- Animated hero with floating gradient orbit elements
- Scroll-triggered reveal animations across services and workflow
- Scroll progress timeline interaction
- Interactive hover and micro-motion effects
- API-driven homepage content (`/api/content/homepage`)
- Mongo-ready service model with fallback content if DB is empty

## Project Structure
- `client/` - React SaaS frontend
- `server/` - Express API and Mongo models

## Run Locally
### 1) Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### 2) Frontend
```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:5001`.

> **Note:** macOS often reserves port `5000` for AirPlay Receiver. If you see `EADDRINUSE`, use port `5001` (default in `.env`) or disable AirPlay in **System Settings → General → AirDrop & Handoff → AirPlay Receiver**.
