# HydroShield — Frontend Application

Modern React + Vite frontend for the HydroShield AI-Powered Flood Management System.

---

## 🛠 Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:5173`.

---

## 🚀 Deployment Instructions

### Deploy to Vercel (Recommended)
1. Push this folder or whole repository to GitHub.
2. Import project in **Vercel**.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://<your-backend-domain>/api`
5. Click **Deploy**.

### Deploy to Netlify
1. Connect repository to Netlify.
2. Set **Base Directory** to `frontend`.
3. Build Command: `npm run build`
4. Publish Directory: `frontend/dist`
5. Add Environment Variable `VITE_API_BASE_URL` pointing to your backend `/api` endpoint.
