import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- Importar hook de Auth

interface HeaderProps {
  league: 'Fut-7' | 'Fut-5';
  setLeague: (league: 'Fut-7' | 'Fut-5') => void;
}

const Header: React.FC<HeaderProps> = ({ league, setLeague }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth(); // <-- Usar el contexto
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirige a la página principal después de cerrar sesión
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <NavLink to="/" className="navbar-brand">
            {/* ... (código del logo sin cambios) ... */}
            <span>Aspastecos Stats</span>
          </NavLink>
          <nav className="navbar-nav-desktop">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
            <NavLink to="/players" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Jugadores</NavLink>
            <NavLink to="/matches" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Partidos</NavLink>
          </nav>
        </div>

        <div className="navbar-right">
          <div className="league-selector-nav">
            <button className={league === 'Fut-7' ? 'active' : ''} onClick={() => setLeague('Fut-7')}>Fut-7</button>
            <button className={league === 'Fut-5' ? 'active' : ''} onClick={() => setLeague('Fut-5')}>Fut-5</button>
          </div>

          {/* --- LÓGICA CONDICIONAL AQUÍ --- */}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn-login">Cerrar Sesión</button>
          ) : (
            <NavLink to="/login" className="btn-login">Iniciar Sesión</NavLink>
          )}
          
          <button className="hamburger-menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {/* ... (código del icono de hamburguesa sin cambios) ... */}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="navbar-nav-mobile">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink>
          <NavLink to="/players" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setIsMobileMenuOpen(false)}>Jugadores</NavLink>
          <NavLink to="/matches" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setIsMobileMenuOpen(false)}>Partidos</NavLink>
        </nav>
      )}
    </header>
  );
};

export default Header;