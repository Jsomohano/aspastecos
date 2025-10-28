import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Players from './components/Players';
import Matches from './components/Matches';
import AddMatch from './components/AddMatch';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-content">
            <h1>⚽ Estadísticas del Equipo</h1>
            <p>Liga de Fútbol 7</p>
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/players" element={<Players />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/add-match" element={<AddMatch />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

