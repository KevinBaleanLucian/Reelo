import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { XIcon } from '../components/Icons.jsx';
import { ToastContext } from './ToastContext.js';
import './Toast.css';

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message, { tone = 'info', duration = 5000 } = {}) => {
      const id = nextId++;

      setToasts((current) =>
        [...current.filter((toast) => toast.message !== message), { id, message, tone }].slice(-3)
      );
      timers.current.set(id, setTimeout(() => dismiss(id), duration));

      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach((timer) => clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.tone}`}>
            <p className="toast__message">{toast.message}</p>
            <button
              type="button"
              className="toast__close"
              aria-label="Dismiss message"
              onClick={() => dismiss(toast.id)}
            >
              <XIcon size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}