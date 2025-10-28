import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { matchAPI, playerAPI } from '../api/client';

interface Player {
  _id: string;
  name: string;
}

interface AddMatchProps {
  league: string;
  isEditing?: boolean;
}

const AddMatch: React.FC<AddMatchProps> = ({ league, isEditing }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [opponent, setOpponent] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [playersPlayed, setPlayersPlayed] = useState<string[]>([]);
  const [goalsByPlayer, setGoalsByPlayer] = useState<Record<string, number>>({});
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    loadPlayers();
    if (isEditing && id) {
      loadMatchData(id);
    }
  }, [league, id, isEditing]);

  const loadPlayers = async () => {
    try {
      const res = await playerAPI.getAll(league);
      setPlayers(res.data);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const loadMatchData = async (matchId: string) => {
    try {
      const res = await matchAPI.getById(matchId);
      const match = res.data;
      setDate(new Date(match.date).toISOString().split('T')[0]);
      setOpponent(match.opponent);
      setPlayersPlayed(match.playersPlayed || []);
      setGoalsByPlayer(match.goalsByPlayer || {});
      const [hScore, aScore] = match.score.split('-');
      setHomeScore(hScore);
      setAwayScore(aScore);
    } catch (error) {
      console.error('Error loading match data:', error);
    }
  };

  const determineResult = (hScore: number, aScore: number): 'Victoria' | 'Derrota' | 'Empate' => {
    if (hScore > aScore) return 'Victoria';
    if (hScore < aScore) return 'Derrota';
    return 'Empate';
  };

  const handlePlayerPlayedChange = (playerId: string) => {
    setPlayersPlayed(prev =>
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  // --- ¡NUEVA FUNCIÓN AQUÍ! ---
  // Si no todos están seleccionados, los selecciona.
  // Si ya están todos seleccionados, los deselecciona.
  const handleSelectAll = () => {
    const allPlayerIds = players.map(p => p._id);
    if (playersPlayed.length === allPlayerIds.length) {
      setPlayersPlayed([]); // Deseleccionar todos
    } else {
      setPlayersPlayed(allPlayerIds); // Seleccionar todos
    }
  };

  const handleGoalChange = (playerId: string, goals: string) => {
    const numGoals = parseInt(goals, 10);
    if (!isNaN(numGoals) && numGoals >= 0) {
      setGoalsByPlayer(prev => ({ ...prev, [playerId]: numGoals }));
    } else if (goals === '') {
      const { [playerId]: _, ...rest } = goalsByPlayer;
      setGoalsByPlayer(rest);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hScoreNum = parseInt(homeScore, 10);
    const aScoreNum = parseInt(awayScore, 10);

    if (isNaN(hScoreNum) || isNaN(aScoreNum) || hScoreNum < 0 || aScoreNum < 0) {
      alert('Por favor, introduce un marcador válido.');
      return;
    }

    const matchData = {
      date,
      opponent,
      result: determineResult(hScoreNum, aScoreNum),
      score: `${hScoreNum}-${aScoreNum}`,
      playersPlayed,
      goalsByPlayer,
      league,
    };

    try {
      if (isEditing && id) {
        await matchAPI.update(id, matchData);
      } else {
        await matchAPI.create(matchData);
      }
      navigate('/matches');
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Error al guardar el partido.');
    }
  };

  return (
    <div className="tab-content">
      <form onSubmit={handleSubmit} className="add-match-form">
        <h2>{isEditing ? 'Editar Partido' : `Agregar Nuevo Partido (${league})`}</h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Fecha</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Rival</label>
            <input type="text" value={opponent} onChange={e => setOpponent(e.target.value)} required />
          </div>
        </div>

        <div className="form-group">
          <h3>Marcador</h3>
          <div className="score-input-container">
            <span className="team-name">Aspastecos</span>
            <input type="number" min="0" value={homeScore} onChange={e => setHomeScore(e.target.value)} required className="score-input" />
            <span className="separator">-</span>
            <input type="number" min="0" value={awayScore} onChange={e => setAwayScore(e.target.value)} required className="score-input" />
            <span className="team-name">{opponent || 'Rival'}</span>
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3>Jugadores que participaron</h3>
            {/* --- ¡NUEVO BOTÓN AQUÍ! --- */}
            <button type="button" className="btn btn-sm" onClick={handleSelectAll}>
              {playersPlayed.length === players.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
            </button>
          </div>
          <div className="checkbox-grid">
            {players.map(player => (
              <div key={player._id} className="checkbox-item">
                <input type="checkbox" id={`player-${player._id}`} checked={playersPlayed.includes(player._id)} onChange={() => handlePlayerPlayedChange(player._id)} />
                <label htmlFor={`player-${player._id}`}>{player.name}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <h3>Goles por Jugador</h3>
          <div className="goals-grid">
            {players.filter(p => playersPlayed.includes(p._id)).map(player => (
                <div key={player._id} className="goal-input-item">
                  <label>{player.name}</label>
                  <input type="number" min="0" placeholder="0" value={goalsByPlayer[player._id] || ''} onChange={(e) => handleGoalChange(player._id, e.target.value)} />
                </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="submit" className="btn">✅ {isEditing ? 'Guardar Cambios' : 'Guardar Partido'}</button>
          <button type="button" className="btn btn-danger" onClick={() => navigate('/matches')}>❌ Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default AddMatch;