import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { TourProvider } from './reference/tour';
import { StoreProvider } from './services/store';
import './index.css';

// BASE_URL is "/" locally and "/prototype/" on the deployed site.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <StoreProvider>
        <TourProvider>
          <App />
        </TourProvider>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
);
