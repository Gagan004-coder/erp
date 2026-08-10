import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: { background: '#1e2435', color: '#f3f4f6', border: '1px solid #2d3748' },
        success: { iconTheme: { primary: '#10b981', secondary: '#1e2435' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#1e2435' } },
      }}
    />
  </React.StrictMode>
);
