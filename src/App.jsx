import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';

import Dashboard              from './pages/Dashboard/Dashboard';
import HydrologicalAgent      from './pages/HydrologicalAgent/HydrologicalAgent';
import UrbanHydrodynamicAgent from './pages/UrbanHydrodynamicAgent/UrbanHydrodynamicAgent';
import MunicipalDecisionAgent from './pages/MunicipalDecisionAgent/MunicipalDecisionAgent';
import CivilProtectionAgent   from './pages/CivilProtectionAgent/CivilProtectionAgent';
import CitizenSOS             from './pages/CitizenSOS/CitizenSOS';
import RescueMissionPlanner   from './pages/RescueMissionPlanner/RescueMissionPlanner';
import AgentStatus            from './pages/AgentStatus/AgentStatus';
import MissionReport          from './pages/MissionReport/MissionReport';
import Settings               from './pages/Settings/Settings';
import RecentUpdates          from './pages/RecentUpdates/RecentUpdates';
import CommunityPeople        from './pages/CommunityPeople/CommunityPeople';
import MapPage                from './pages/MapPage/MapPage';

/** Redirects to /login if not authenticated */
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

/** Redirects to / if user doesn't have admin access */
function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin)         return <Navigate to="/" replace />;
  return children;
}

/** Redirects admins away — page is for regular users only */
function RequireUser({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (isAdmin)          return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public: Login */}
            <Route path="/login" element={<Login />} />

            {/* Protected: wrap all inside Layout */}
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <Layout>
                    <Routes>
                      {/* Available to all authenticated roles */}
                      <Route path="/"                   element={<Dashboard />} />
                      <Route path="/hydrological-agent" element={<HydrologicalAgent />} />
                      <Route path="/urban-agent"        element={<UrbanHydrodynamicAgent />} />
                      <Route path="/civil-protection"   element={<CivilProtectionAgent />} />
                      <Route path="/map"                element={<MapPage />} />
                      <Route path="/settings"           element={<Settings />} />

                      {/* User only (admin gets redirected to /) */}
                      <Route path="/citizen-sos"        element={<RequireUser><CitizenSOS /></RequireUser>} />

                      {/* Admin only */}
                      <Route path="/agent-status"       element={<RequireAdmin><AgentStatus /></RequireAdmin>} />
                      <Route path="/municipal-agent"    element={<RequireAdmin><MunicipalDecisionAgent /></RequireAdmin>} />
                      <Route path="/mission-report"     element={<RequireAdmin><MissionReport /></RequireAdmin>} />
                      <Route path="/rescue-planner"     element={<RequireAdmin><RescueMissionPlanner /></RequireAdmin>} />
                      <Route path="/recent-updates"     element={<RequireAdmin><RecentUpdates /></RequireAdmin>} />
                      <Route path="/community-people"   element={<RequireAdmin><CommunityPeople /></RequireAdmin>} />

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </RequireAuth>
              }
            />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
