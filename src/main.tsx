/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Auto-update service worker registration.
// `autoUpdate` strategy means new SWs take over on next page load.
const updateSW = registerSW({
  immediate: true,
  onRegisterError(error) {
    console.error('[SW] Registration failed:', error);
  },
});

// Expose for the "update available" toast (could be wired to react-hot-toast later).
void updateSW;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
