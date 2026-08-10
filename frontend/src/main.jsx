import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#0a1628',
          color: '#f0f8ff',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          fontSize: '13px',
          fontFamily: 'Inter, sans-serif',
        },
        success: { iconTheme: { primary: '#00ff88', secondary: '#0a1628' } },
        error:   { iconTheme: { primary: '#ff3030', secondary: '#0a1628' } },
      }}
    />
  </React.StrictMode>
);
