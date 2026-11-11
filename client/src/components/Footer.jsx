import { Link } from "react-router";
import Logo from "./Logo.jsx";
import { InstagramIcon, YouTubeIcon } from './Icons.jsx';
import './Footer.css';
import tmdbLogo from '../assets/tmdb-logo.svg'
const mainLinks = [
  { to: '/about', label: 'About Reelo' },
  { to: '/journal', label: 'The Journal' },
  { to: '/help', label: 'Help & support' },
  { to: '/contact', label: 'Contact' },
];

const legalLinks = [
  { to: '/privacy', label: 'Privacy policy' },
  { to: '/terms', label: 'Terms of use' },
  { to: '/cookies', label: 'Cookie preferences' },
];

const socials = [
  { href: 'https://www.instagram.com/', label: 'Reelo on Instagram', Icon: InstagramIcon },
  { href: 'https://www.youtube.com/', label: 'Reelo on YouTube', Icon: YouTubeIcon },
];

const currentYear = new Date().getFullYear();

function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer__top">
                    <div className="footer__brand">
                        <Logo size="sm" />
                        <p className="footer__tagline">Less scrolling. More cinema.</p>
                    </div>

                    <nav className="footer__links" aria-label="Footer">
                        {mainLinks.map(({to,label}) => (
                            <Link key={to} to={to} className="footer__link">
                                {label}
                            </Link>
                        ))}
                    </nav>

                    <div className="footer__socials">
                        {socials.map(({href, label, Icon}) => (
                            <a
                             key={label}
                             href={href}
                             className="footer__social"
                             aria-label={label}
                             target="_blank"
                             rel="noopener noreferrer"
                             >
                                <Icon size={20} />
                             </a>
                        ))}
                    </div>
                </div>

                <div className="footer__bottom">
                    <p className="footer__small">
                        © {currentYear} Reelo. A world of stories, thoughtfully selected.
                    </p>

                    <nav className="footer__legal" aria-label="Legal">
                        {legalLinks.map(({to,label})=> (
                            <Link key={to} to={to} className="footer__small footer__legal-link">
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="footer__attribution">
                    <img src={tmdbLogo} alt="TMDB" height="12" />
                    <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;