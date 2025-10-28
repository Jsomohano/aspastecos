import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchAPI, playerAPI } from '../api/client';

interface Player {
  _id: string;
  name: string;
}

interface AddMatchProps {
  league: string;
}

const AddMatch: React.FC<AddMatchProps> = ({ league }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [opponent, setOpponent] = useState('');
  const [result, setResult] = useState<'Victoria' | 'Derrota' | 'Empate'>('Victoria');
  const [score, setScore] = useState('');
  const [playersPlayed, setPlayersPlayed] = useState<string[]>([]);
  const [goalsByPlayer, setGoalsByPlayer] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadPlayers();
  }, [league]);

  const loadPlayers = async () => {
    try {
      const res = await playerAPI.getAll(league);
      setPlayers(res.data);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const handlePlayerPlayedChange = (playerId: string) => {
    setPlayersPlayed(prev =>
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  const handleGoalChange = (playerId: string, goals: string) => {
    const numGoals = parseInt(goals, 10);
    if (!isNaN(numGoals) && numGoals >= 0) {
      setGoalsByPlayer(prev => ({ ...prev, [playerId]: numGoals }));
    } else if (goals === '') {
      const newGoals = { ...goalsByPlayer };
      delete newGoals[playerId];
      setGoalsByPlayer(newGoals);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!score.match(/^\d+-\d+$/)) {
      alert('El marcador debe tener el formato "Goles-Goles", por ejemplo, "3-1".');
      return;
    }

    const newMatch = {
      date,
      opponent,
      result,
      score,
      playersPlayed,
      goalsByPlayer,
      league, // Se añade la liga al partido
    };

    try {
      await matchAPI.create(newMatch);
      navigate('/matches');
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Error al agregar el partido.');
    }
  };

  return (
    <div className="tab-content">
      <form onSubmit={handleSubmit} className="add-match-form">
        <h2>Agregar Nuevo Partido ({league})</h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Fecha</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Rival</label>
            <input type="text" value={opponent} onChange={e => setOpponent(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Resultado</label>
            <select value={result} onChange={e => setResult(e.target.value as any)} required>
              <option value="Victoria">Victoria</option>
              <option value="Derrota">Derrota</option>
              <option value="Empate">Empate</option>
            </select>
          </div>
          <div className="form-group">
            <label>Marcador (Ej: 3-1)</label>
            <input type="text" value={score} onChange={e => setScore(e.target.value)} required pattern="\d+-\d+" />
          </div>
        </div>

        <div className="form-group">
          <h3>Jugadores que participaron</h3>
          <div className="checkbox-grid">
            {players.map(player => (
              <div key={player._id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`player-${player._id}`}
                  checked={playersPlayed.includes(player._id)}
                  onChange={() => handlePlayerPlayedChange(player._id)}
                />
                <label htmlFor={`player-${player._id}`}>{player.name}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <h3>Goles por Jugador</h3>
          <div className="goals-grid">
            {players
              .filter(p => playersPlayed.includes(p._id))
              .map(player => (
                <div key={player._id} className="goal-input-item">
                  <label>{player.name}</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={goalsByPlayer[player._id] || ''}
                    onChange={(e) => handleGoalChange(player._id, e.target.value)}
                  />
                </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="submit" className="btn">✅ Guardar Partido</button>
          <button type="button" className="btn btn-danger" onClick={() => navigate('/matches')}>❌ Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default AddMatch;