import { Link, useLocation } from 'react-router-dom';
import AuthButton from './AuthButton';
import './Navbar.css';

const Navbar = () => {
  console.log('📍 Navbar component rendering...');
  
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/predict', label: 'Predict' },
    { path: '/simulate', label: 'Simulate' },
    { path: '/chat', label: 'AI Chat' },
    { path: '/compare', label: 'Compare' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">AERO</span>
          <span className="logo-accent">VELOCITY</span>
        </Link>
        
        <div className="navbar-right">
          <ul className="navbar-menu">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

