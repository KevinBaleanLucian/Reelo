import { useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import Button from './Button.jsx';
import { BookmarkIcon, MenuIcon } from './Icons.jsx';
import Logo from './Logo.jsx';
import MobileMenu from './MobileMenu.jsx';
import NavbarSearch from './NavbarSearch.jsx';
import UserMenu from './UserMenu.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useAuthLinkState } from '../hooks/useAuthLinkState.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useWatchlistLink } from '../hooks/useWatchlistLink.js';
import { TABLET_QUERY } from '../utils/breakpoints.js';
import { NAV_LINKS } from '../utils/navLinks.js';
import './MovieCard.css';
import './Navbar.css';

function Navbar({ watchlistCount = 0 }) {
  const { status } = useAuth();
  const authState = useAuthLinkState();
  const watchlistLink = useWatchlistLink();
  const location = useLocation();
  const compact = useMediaQuery(TABLET_QUERY);
  const menuButtonRef = useRef(null);
  const [openedAt, setOpenedAt] = useState(null);

  if (openedAt !== null && (openedAt !== location.key || !compact)) {
    setOpenedAt(null);
  }

  const menuOpen = openedAt !== null;

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Logo />

        <nav className="navbar__links" aria-label="Main">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className="navbar__link">
              {label}
            </NavLink>
          ))}
        </nav>

        <NavbarSearch />

        <div className="navbar__actions">
          <Button {...watchlistLink} variant="secondary" className="navbar__watchlist">
            <BookmarkIcon size={18} />
            Watchlist
            {watchlistCount > 0 && (
              <span className="navbar__badge">{String(watchlistCount).padStart(2, '0')}</span>
            )}
          </Button>

          <span className="navbar__divider" aria-hidden="true" />

          {status === 'authenticated' && <UserMenu />}

          {status === 'loading' && <span className="skeleton navbar__avatar-skeleton" aria-hidden="true" />}

          {status === 'anonymous' && (
            <>
              <Link to="/login" state={authState} className="navbar__login">
                Log In
              </Link>
              <Button to="/signup" state={authState}>
                Sign Up
              </Button>
            </>
          )}
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="navbar__icon-btn navbar__menu-button"
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={(event) => {
            event.currentTarget.focus();
            setOpenedAt(location.key);
          }}
        >
          <MenuIcon size={22} />
        </button>
      </div>

      {menuOpen && (
        <MobileMenu
          watchlistLink={watchlistLink}
          watchlistCount={watchlistCount}
          onClose={() => setOpenedAt(null)}
        />
      )}
    </header>
  );
}

export default Navbar;