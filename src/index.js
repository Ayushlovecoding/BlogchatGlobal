import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import 'react-loading-skeleton/dist/skeleton.css';
import App from './App';

// Safely guard calls to window.close() to avoid Cross-Origin-Opener-Policy warnings
// Only allow window.close if the opener is same-origin (or there is no opener).
if (typeof window !== 'undefined' && window.close) {
  try {
    const _origClose = window.close.bind(window);
    window.close = function() {
      try {
        // If there is no opener, allow close
        if (!window.opener) return _origClose();
        // Try to access opener's origin; this will throw if cross-origin
        const openerOrigin = window.opener.location && window.opener.location.origin;
        if (openerOrigin === window.location.origin) {
          return _origClose();
        }
        // Otherwise, silently ignore or log a warning
        console.warn('Blocked window.close() due to cross-origin opener.');
        return;
      } catch (err) {
        // cross-origin access will throw; avoid calling close to prevent COOP warning
        console.warn('Blocked window.close() due to cross-origin opener (exception).');
        return;
      }
    };
  } catch (err) {
    // ignore
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);