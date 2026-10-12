import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker in production for offline capability & PWA installability
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swPath = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swPath).catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

