import { Link, NavLink } from 'react-router';
import Button from './Button.jsx';
import Logo from './Logo.jsx';
import NavbarSearch from './NavbarSearch.jsx';
import UserMenu from './UserMenu.jsx';
import { BookmarkIcon } from './Icons.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useAuthLinkState } from '../hooks/useAuthLinkState.js';
import './MovieCard.css';
import './Navbar.css';

const links = [
  { to: '/', label: 'Discover', end: true },
  { to: '/movies', label: 'Movies' },
  { to: '/series', label: 'Series' },
];

function Navbar({ watchlistCount = 0 }) {
  const { status } = useAuth();
  const authState = useAuthLinkState();

  const watchlistLink =
    status === 'authenticated'
      ? { to: '/watchlist' }
      : { to: '/login', state: { ...authState, from: { pathname: '/watchlist' } } };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Logo />

        <nav className="navbar__links" aria-label="Main">
          {links.map(({ to, label, end }) => (
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
      </div>
    </header>
  );
}

export default Navbar;