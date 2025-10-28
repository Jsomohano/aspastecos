import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header'; // Importamos el nuevo componente
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
        {/* El nuevo Header va aquí, pasándole las props necesarias */}
        <Header league={league} setLeague={setLeague} />

        {/* El contenido principal de la página se renderiza aquí abajo */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard league={league} />} />
            <Route path="/players" element={<Players league={league} />} />
            <Route path="/matches" element={<Matches league={league} />} />
            {/* Las rutas para agregar y editar se mantienen igual */}
            <Route path="/add-match" element={<AddMatch league={league} />} />
            <Route path="/edit-match/:id" element={<AddMatch league={league} isEditing />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;