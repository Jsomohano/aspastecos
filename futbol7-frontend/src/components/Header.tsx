import React from 'react';
import { NavLink } from 'react-router-dom';

// Definimos los tipos para las props que recibirá el componente
interface HeaderProps {
  league: 'Fut-7' | 'Fut-5';
  setLeague: (league: 'Fut-7' | 'Fut-5') => void;
}

const Header: React.FC<HeaderProps> = ({ league, setLeague }) => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        
        {/* --- Lado Izquierdo: Logo y Navegación --- */}
        <div className="navbar-left">
          <NavLink to="/" className="navbar-brand">
            {/* Logo Genérico (SVG) */}
            <svg className="navbar-logo" width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.93V15h2v2.93c-1.38.35-2.62.35-4 0v-2.93h2zm0-5.93V7h2v5h-2zm-2 0H5.07c-.35-1.38-.35-2.62 0-4H7v4zm2-5V4.07c1.38-.35 2.62-.35 4 0V7h-2zm4 0h2.93c.35 1.38.35 2.62 0 4H15V7zm0 5h2.93c.35 1.38.35 2.62 0 4H15v-4zm-4 5.93V15h2v2.93c1.38-.35 2.62-.35 4 0v-2.93h-2z" fill="currentColor"/>
            </svg>
            <span>Aspastecos Stats</span>
          </NavLink>
          <nav className="navbar-nav">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
            <NavLink to="/players" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Jugadores</NavLink>
            <NavLink to="/matches" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Partidos</NavLink>
          </nav>
        </div>

        {/* --- Lado Derecho: Acciones y Menús --- */}
        <div className="navbar-right">
          <div className="league-selector-nav">
            <button className={league === 'Fut-7' ? 'active' : ''} onClick={() => setLeague('Fut-7')}>Fut-7</button>
            <button className={league === 'Fut-5' ? 'active' : ''} onClick={() => setLeague('Fut-5')}>Fut-5</button>
          </div>
          <button className="btn-login">Iniciar Sesión</button>
          <button className="hamburger-menu">
            {/* Icono de Menú Hamburguesa (SVG) */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;