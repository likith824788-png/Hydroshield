# 🌊 HydroShield – AI Powered Flood Management System

> Professional Disaster Management Command Center built with React.js + FastAPI + MongoDB

---

## 🏗️ Project Structure

```
HydroShield/
├── frontend/          # React 18 + Vite
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── pages/
├── backend/           # FastAPI + Python
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
└── README.md
```

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Edit .env with your MongoDB URL and API keys
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🔑 Environment Variables

Edit `backend/.env`:
| Variable | Description |
|----------|-------------|
| `MONGODB_URL` | MongoDB connection string |
| `DATABASE_NAME` | MongoDB database name |
| `DEFAULT_LATITUDE` | Default location latitude |
| `DEFAULT_LONGITUDE` | Default location longitude |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + React Router v6 |
| Styling | Vanilla CSS Glassmorphism Design System |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Backend | FastAPI + Uvicorn |
| Database | MongoDB + Motor (async) |
| External API | Open-Meteo (free, no key needed) |

## 📄 Pages

1. **Dashboard** – Live weather + flood prediction + status
2. **Hydrological Telemetry Agent** – Sensor telemetry
3. **Urban Hydrodynamic Agent** – AI flood prediction
4. **Municipal Decision Agent** – Recommended actions
5. **Civil Protection Agent** – Emergency status
6. **Citizen SOS** – Emergency report form
7. **AI Rescue Mission Planner** – Resource allocation
8. **AI Agent Status** – System agent monitoring
9. **Mission Report** – Full event report
10. **Settings** – Configuration panel
