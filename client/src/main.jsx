import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './styles/token.css';
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthProvider.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { WatchlistProvider } from './context/WatchlistProvider.jsx';
import { ToastProvider } from './context/ToastProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <WatchlistProvider>
              <App />
            </WatchlistProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
