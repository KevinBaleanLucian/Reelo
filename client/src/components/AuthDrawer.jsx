import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import Logo from './Logo.jsx';
import { XIcon } from './Icons.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import SignUpPage from '../pages/SignUpPage.jsx';
import { useAuth } from '../hooks/useAuth.js';
import './AuthDrawer.css';

const CLOSE_MS = 200;
const LABELS = { '/login': 'Log in', '/signup': 'Sign up' };

function toPath(target) {
  const path = target?.pathname;

  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) {
    return '/';
  }

  return `${path}${target.search ?? ''}${target.hash ?? ''}`;
}

function DrawerShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const timerRef = useRef(null);
  const [closing, setClosing] = useState(false);

  const hasBackground = Boolean(location.state?.background);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('scroll-locked');

    return () => {
      clearTimeout(timerRef.current);
      document.documentElement.classList.remove('scroll-locked');
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    const field = dialogRef.current?.querySelector('input:not([type="hidden"]), select, textarea');
    field?.focus();
  }, [location.pathname]);

  const requestClose = useCallback(() => {
    if (closing) return;
    setClosing(true);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    timerRef.current = setTimeout(
      () => {
        if (hasBackground) navigate(-1);
        else navigate('/', { replace: true });
      },
      reduceMotion ? 0 : CLOSE_MS
    );
  }, [closing, hasBackground, navigate]);

  return (
    <dialog
      ref={dialogRef}
      className={`auth-drawer ${closing ? 'auth-drawer--closing' : ''}`.trim()}
      aria-label={LABELS[location.pathname] ?? 'Account'}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
    >
      <button type="button" className="auth-drawer__backdrop" tabIndex={-1} aria-hidden="true" onClick={requestClose}/>
      <div className="auth-drawer__panel">
        <header className="auth-drawer__header">
          <Logo size="sm" />

          <button type="button" className="auth-drawer__close" aria-label="Close" onClick={requestClose}>
            <XIcon size={20} />
          </button>
        </header>

        <div className="auth-drawer__body">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Routes>
        </div>

        <footer className="auth-drawer__footer">
          <p>For the love of cinema. Always free.</p>

          <nav className="auth-drawer__legal" aria-label="Legal">
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/terms">Terms of use</Link>
            <Link to="/help">Help &amp; support</Link>
          </nav>
        </footer>
      </div>
    </dialog>
  );
}

function AuthDrawer() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'authenticated') {
    const target = location.state?.from ?? location.state?.background;
    return <Navigate to={toPath(target)} replace />;
  }

  if (status === 'loading') {
    return null;
  }

  return <DrawerShell />;
}

export default AuthDrawer;