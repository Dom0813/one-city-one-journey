import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export default function Header() {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // localStorage may fail in private mode
    }
  }, [theme]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <header id="hd">
      <div className="hin">
        <NavLink to="/" className="brand" aria-label="One Journey home">
          <svg viewBox="0 0 40 40" aria-hidden="true">
            <rect x="1" y="1" width="38" height="38" rx="11" fill="var(--bg2)" stroke="var(--bd)" />
            <path d="M9 31V11l11 14" fill="none" stroke="var(--blue)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 25l11-14v20" fill="none" stroke="var(--yellow)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="25" r="5" fill="var(--bg2)" stroke="var(--tx)" strokeWidth="3" />
            <circle cx="9" cy="31" r="2.3" fill="var(--red)" />
            <circle cx="31" cy="31" r="2.3" fill="var(--violet)" />
          </svg>
          <span>
            <span className="wm">ONE<b>/</b>JOURNEY</span>
            <small>Metro • BRTS • AMTS</small>
          </span>
        </NavLink>

        <nav id="nav" aria-label="Main">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Journey
          </NavLink>
          <NavLink to="/operator" className={({ isActive }) => (isActive ? 'active' : '')}>
            Operator view
          </NavLink>
          <NavLink to="/data" className={({ isActive }) => (isActive ? 'active' : '')}>
            Data
          </NavLink>
        </nav>

        <div className="actions">
          <span className={`badge-offline ${!isOnline ? 'is-offline' : ''}`} role="status">
            <span className="status-dot"></span>
            {isOnline ? 'Online • works offline too' : 'Offline mode'}
          </span>
          <button type="button" className="ghost" id="tg" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </div>
    </header>
  );
}
