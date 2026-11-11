import { Link } from "react-router";
import './Logo.css';

function Logo({size ='md'}) {
    return (
        <Link to="/" className={`logo logo--${size}`} aria-label="Reelo, home">
            Reelo<span className="logo__dot">.</span>
        </Link>
    );
}

export default Logo;

