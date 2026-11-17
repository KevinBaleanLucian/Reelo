import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router';
import Button from './Button.jsx';
import { BookmarkIcon, XIcon } from './Icons.jsx';
import Logo from './Logo.jsx';
import MobileSearch from './MobileSearch.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useAuthLinkState } from '../hooks/useAuthLinkState.js';
import { NAV_LINKS } from '../utils/navLinks.js';
import { lockScroll } from '../utils/scrollLock.js';
import { initials } from '../utils/user.js';
import './MovieCard.css';
import './MobileMenu.css';

const CLOSE_MS = 200;

function MobileMenu({ watchlistLink, watchlistCount, onClose }) {
  const { status, user, logout } = useAuth();
  const authState = useAuthLinkState();
  const dialogRef = useRef(null);
  const timerRef = useRef(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    const unlock = lockScroll();

    return () => {
      clearTimeout(timerRef.current);
      unlock();
      if (dialog.open) dialog.close();
    };
  }, []);

  function requestClose() {
    if (closing) return;
    setClosing(true);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timerRef.current = setTimeout(onClose, reduceMotion ? 0 : CLOSE_MS);
  }

  function handleLogout() {
    logout();
    requestClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={`mobile-menu ${closing ? 'mobile-menu--closing' : ''}`.trim()}
      aria-label="Menu"
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
    >
      <button
        type="button"
        className="mobile-menu__backdrop"
        tabIndex={-1}
        aria-hidden="true"
        onClick={requestClose}
      />

      <div className="mobile-menu__panel">
        <header className="mobile-menu__header">
          <Logo size="sm" />

          <button type="button" className="mobile-menu__close" aria-label="Close menu" onClick={requestClose}>
            <XIcon size={20} />
          </button>
        </header>

        <div className="mobile-menu__body">
          <MobileSearch />

          <nav className="mobile-menu__nav" aria-label="Main">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className="mobile-menu__link" onClick={requestClose}>
                {label}
              </NavLink>
            ))}

            <Link {...watchlistLink} className="mobile-menu__link" onClick={requestClose}>
              <BookmarkIcon size={22} />
              Watchlist
              {watchlistCount > 0 && (
                <span className="navbar__badge">{String(watchlistCount).padStart(2, '0')}</span>
              )}
            </Link>
          </nav>

          <div className="mobile-menu__account">
            {status === 'loading' && <span className="skeleton mobile-menu__skeleton" aria-hidden="true" />}

            {status === 'anonymous' && (
              <>
                <Button to="/signup" state={authState} fullWidth onClick={requestClose}>
                  Sign Up
                </Button>
                <Button to="/login" state={authState} variant="secondary" fullWidth onClick={requestClose}>
                  Log In
                </Button>
              </>
            )}

            {status === 'authenticated' && user && (
              <>
                <div className="mobile-menu__user">
                  <span className="mobile-menu__avatar" aria-hidden="true">
                    {initials(user)}
                  </span>
                  <span className="mobile-menu__identity">
                    <span className="mobile-menu__name">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="mobile-menu__handle">@{user.username}</span>
                  </span>
                </div>

                <Link
                  to={`/profile/${encodeURIComponent(user.username)}`}
                  className="mobile-menu__item"
                  onClick={requestClose}
                >
                  My profile
                </Link>
                <Link to="/chat" className="mobile-menu__item" onClick={requestClose}>
                  Messages
                </Link>
                <button type="button" className="mobile-menu__item" onClick={handleLogout}>
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default MobileMenu;