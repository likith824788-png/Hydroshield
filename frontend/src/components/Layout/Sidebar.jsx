import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Droplets, Brain, Building2, Shield,
  AlertTriangle, Map, Bot, FileText, Settings,
  Waves, Bell, Users, MapPin, CloudRain
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const navItems = [
  { path: '/',                   label: 'Dashboard',          icon: LayoutDashboard, adminOnly: false, userOnly: false },
  { path: '/hydrological-agent', label: 'Hydrological Agent', icon: Droplets,        adminOnly: false, userOnly: false },
  { path: '/urban-agent',        label: 'Urban Hydrodynamic', icon: Brain,           adminOnly: false, userOnly: false },
  { path: '/municipal-agent',    label: 'Municipal Decision', icon: Building2,       adminOnly: true,  userOnly: false },
  { path: '/civil-protection',   label: 'Civil Protection',   icon: Shield,          adminOnly: false, userOnly: false },
  { path: '/map',                label: 'Map',                icon: MapPin,          adminOnly: false, userOnly: false },
  { path: '/rain-forecast',      label: 'Rain Forecast',      icon: CloudRain,       adminOnly: false, userOnly: false },
  { path: '/citizen-sos',        label: 'Citizen SOS',        icon: AlertTriangle,   adminOnly: false, userOnly: true  },
  { path: '/rescue-planner',     label: 'Rescue Planner',     icon: Map,             adminOnly: true,  userOnly: false },
  { path: '/agent-status',       label: 'AI Agent Status',    icon: Bot,             adminOnly: true,  userOnly: false },
  { path: '/mission-report',     label: 'Mission Report',     icon: FileText,        adminOnly: true,  userOnly: false },
  { path: '/recent-updates',     label: 'Recent Updates',     icon: Bell,            adminOnly: true,  userOnly: false },
  { path: '/community-people',   label: 'Community People',   icon: Users,           adminOnly: true,  userOnly: false },
  { path: '/settings',           label: 'Settings',           icon: Settings,        adminOnly: false, userOnly: false },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { isAdmin } = useAuth();

  // Admin sees adminOnly + shared; User sees userOnly + shared (not adminOnly)
  const visibleItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.userOnly  &&  isAdmin) return false;
    return true;
  });

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo — click to toggle collapse */}
      <div
        className="sidebar-logo sidebar-logo-toggle"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <div className="logo-icon">
          <Waves size={22} color="#00d4ff" />
        </div>
        {!collapsed && (
          <div className="logo-text">
            <span className="logo-name">HydroShield</span>
            <span className="logo-tag">AI FLOOD MGMT</span>
          </div>
        )}
      </div>

      <div className="sidebar-divider" />

      <nav className="sidebar-nav">
        {visibleItems.map(({ path, label, icon: Icon, adminOnly }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${adminOnly ? 'admin-link' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <span className="link-icon">
              <Icon size={18} />
            </span>
            {!collapsed && <span className="link-label">{label}</span>}
            {!collapsed && adminOnly && (
              <span className="admin-badge" title="Admin only">A</span>
            )}
            {!collapsed && <span className="link-indicator" />}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}
