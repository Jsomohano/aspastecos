import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Players from './components/Players';
import Matches from './components/Matches';
import AddMatch from './components/AddMatch';
import Login from './components/Login'; // <-- Importar Login
import './App.css';

type League = 'Fut-7' | 'Fut-5';

function App() {
  const [league, setLeague] = useState<League>('Fut-7');

  return (
    <Router>
      <div className="app">
        <Header league={league} setLeague={setLeague} />

        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} /> {/* <-- NUEVA RUTA */}
            <Route path="/" element={<Dashboard league={league} />} />
            <Route path="/players" element={<Players league={league} />} />
            <Route path="/matches" element={<Matches league={league} />} />
            <Route path="/add-match" element={<AddMatch league={league} />} />
            <Route path="/edit-match/:id" element={<AddMatch league={league} isEditing />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;