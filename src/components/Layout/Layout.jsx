import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <main className="main-content">
          {children}
        </main>
        <footer className="app-footer">
          <span className="footer-brand">HydroShield</span>
          <span className="footer-sep">·</span>
          <span className="footer-subtitle">AI Powered Flood Management System</span>
        </footer>
      </div>
    </div>
  );
}
