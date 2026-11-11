import { Link, NavLink } from "react-router";
import Button from "./Button.jsx";
import Logo from "./Logo.jsx";
import { BookmarkIcons, SearchIcons } from "./Icons.jsx";
import './Navbar.css';

const links =[
    { to: '/', label: 'Discover', end: true},
    { to: '/movies', label:'Movies'},
    { to: '/series', label:'Series'},
];

function Navbar({watchlistCount=0}){
    return (
        <header className="navbar">
            <div className="container navbar__inner">
                <Logo />

                <nav className="navbar__links" aria-label="Main">
                    {links.map(({to,label,end}) => (
                        <NavLink key={to} to={to} end={end} className="navbar__link">
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="navbar__actions">
                    <button type="button" className="navbar__icon-btn" aria-label="Search">
                        <SearchIcons />
                    </button>

                    <Button to="/watchlist" variant="secondary" className="navbar__watchlist">
                        <BookmarkIcons size={18} />
                        Watchlist
                        {watchlistCount > 0 && (
                            <span className="navbar__badge">{String(watchlistCount).padStart(2, '0')}</span>
                        )}
                    </Button>

                    <Link to="/login" className="navbar__login">
                        Log In
                    </Link>
                    <Button to="/signup">Sign Up</Button>
                </div>
            </div>
        </header>
    );
}

export default Navbar;