import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Players from './components/Players';
import Matches from './components/Matches';
import AddMatch from './components/AddMatch';
import './App.css';

type League = 'Fut-7' | 'Fut-5';

function App() {
  const [league, setLeague] = useState<League>('Fut-7');

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-content">
            <h1>⚽ Estadísticas del Equipo</h1>
            <p>Liga de {league}</p>
          </div>
          <div className="league-selector">
            <button 
              className={league === 'Fut-7' ? 'active' : ''} 
              onClick={() => setLeague('Fut-7')}
            >
              Fut-7
            </button>
            <button 
              className={league === 'Fut-5' ? 'active' : ''} 
              onClick={() => setLeague('Fut-5')}
            >
              Fut-5
            </button>
          </div>
        </header>

        <nav className="nav-tabs">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
            end
          >
            📊 Dashboard
          </NavLink>
          <NavLink 
            to="/players" 
            className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
          >
            👥 Jugadores
          </NavLink>
          <NavLink 
            to="/matches" 
            className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
          >
            📅 Partidos
          </NavLink>
          <NavLink 
            to="/add-match" 
            className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
          >
            ➕ Agregar Partido
          </NavLink>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard league={league} />} />
            <Route path="/players" element={<Players league={league} />} />
            <Route path="/matches" element={<Matches league={league} />} />
            <Route path="/add-match" element={<AddMatch league={league} />} />
            {/* RUTA NUEVA PARA EDITAR */}
            <Route path="/edit-match/:id" element={<AddMatch league={league} isEditing />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;