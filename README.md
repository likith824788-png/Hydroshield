# 🌊 HydroShield – AI Powered Flood Management System

> Professional Disaster Management Command Center with separated **Frontend** (React 18 + Vite) and **Backend** (FastAPI + MongoDB).

---

## 🏗️ Project Architecture

```
HydroShield/
├── frontend/             # React 18 + Vite Web Application
│   ├── src/              # Source components & pages
│   ├── index.html        # HTML entry point
│   ├── vite.config.js    # Vite configuration
│   ├── vercel.json       # Vercel SPA routing
│   ├── netlify.toml      # Netlify SPA redirects
│   ├── .env              # Frontend local environment
│   └── README.md         # Frontend documentation
│
├── backend/              # FastAPI + Python Backend Server
│   ├── app/              # FastAPI app, routes, database & services
│   ├── main.py           # Entry point
│   ├── create_admin.py   # Database seeding script
│   ├── requirements.txt  # Python dependencies
│   ├── Procfile          # Render / Heroku deployment script
│   ├── Dockerfile        # Container build instructions
│   ├── .env              # Backend environment variables
│   └── README.md         # Backend documentation
│
└── README.md             # Project documentation
```

---

## 🚀 Local Development

### 1. Start the Backend API
```bash
cd backend
pip install -r requirements.txt
python main.py
```
> Server will start at `http://localhost:8000`. Swagger API docs at `http://localhost:8000/docs`.

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
> Application will start at `http://localhost:5173`.

---

## 🌐 Production Deployment

### 1. Backend Deployment (Render / Railway / Fly.io / Docker)
- **Render / Railway**:
  1. Create a new **Web Service** pointing to your repository.
  2. Set **Root Directory** to `backend`.
  3. Build Command: `pip install -r requirements.txt`
  4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  5. Add Environment Variables from `backend/.env` (`MONGODB_URL`, `GEMINI_API_KEY`, etc.).

- **Docker Container**:
  ```bash
  cd backend
  docker build -t hydroshield-backend .
  docker run -p 8000:8000 --env-file .env hydroshield-backend
  ```

### 2. Frontend Deployment (Vercel / Netlify / Cloudflare Pages)
- **Vercel**:
  1. Create a new project in **Vercel** connected to your repository.
  2. Set **Root Directory** to `frontend`.
  3. Add Environment Variable:
     - `VITE_API_BASE_URL`: `https://<your-backend-domain>/api`
  4. Deploy! `vercel.json` will automatically handle SPA client-side routing.

- **Netlify**:
  1. Import project in **Netlify**.
  2. Set **Base Directory** to `frontend`, **Publish Directory** to `frontend/dist`.
  3. Set Environment Variable `VITE_API_BASE_URL` to your backend `/api` endpoint.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + React Router v6 |
| **Styling** | Custom Glassmorphism CSS Design System |
| **Charts & Motion** | Recharts + Framer Motion |
| **Backend** | FastAPI + Uvicorn + Pydantic |
| **Database** | MongoDB Atlas + Motor (async driver) |
| **AI Integration** | Google Gemini API (gemma-2-27b-it) |
| **Email Alerts** | Resend API |
