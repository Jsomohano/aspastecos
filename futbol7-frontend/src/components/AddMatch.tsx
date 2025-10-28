import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playerAPI, matchAPI } from '../api/client';

interface Player {
  _id: string;
  name: string;
}

const AddMatch: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [formData, setFormData] = useState({
    date: '',
    opponent: '',
    ourGoals: '',
    opponentGoals: '',
    leaguePosition: '',
    goalsByPlayer: {} as Record<string, number>,
    playersPlayed: [] as string[],
  });

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const res = await playerAPI.getAll();
      setPlayers(res.data);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!players.length) {
      alert('Primero debes agregar jugadores');
      return;
    }

    try {
      await matchAPI.create({
        date: formData.date,
        opponent: formData.opponent,
        ourGoals: parseInt(formData.ourGoals),
        opponentGoals: parseInt(formData.opponentGoals),
        leaguePosition: formData.leaguePosition ? parseInt(formData.leaguePosition) : null,
        goalsByPlayer: formData.goalsByPlayer,
        playersPlayed: formData.playersPlayed,
      });
      alert('¡Partido guardado exitosamente!');
      navigate('/matches');
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Error al guardar partido');
    }
  };

  const togglePlayerPlayed = (playerId: string) => {
    setFormData(prev => ({
      ...prev,
      playersPlayed: prev.playersPlayed.includes(playerId)
        ? prev.playersPlayed.filter(id => id !== playerId)
        : [...prev.playersPlayed, playerId],
    }));
  };

  return (
    <div className="tab-content">
      <h2>Registrar Nuevo Partido</h2>
      {players.length === 0 ? (
        <p className="text-center">Primero debes agregar jugadores al equipo.</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="form-group">
            <label>Fecha del Partido</label>
            <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Rival</label>
            <input type="text" required placeholder="Nombre del equipo rival" value={formData.opponent} onChange={(e) => setFormData({...formData, opponent: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Nuestros Goles</label>
            <input type="number" min="0" required value={formData.ourGoals} onChange={(e) => setFormData({...formData, ourGoals: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Goles del Rival</label>
            <input type="number" min="0" required value={formData.opponentGoals} onChange={(e) => setFormData({...formData, opponentGoals: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Posición en Liga</label>
            <input type="number" min="1" placeholder="Posición después del partido" value={formData.leaguePosition} onChange={(e) => setFormData({...formData, leaguePosition: e.target.value})} />
          </div>

          <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Goles por Jugador</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            {players.map(player => (
              <div key={player._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <label style={{ minWidth: '120px' }}>{player.name}:</label>
                <input
                  type="number"
                  min="0"
                  style={{ width: '60px' }}
                  value={formData.goalsByPlayer[player._id] || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    goalsByPlayer: {...formData.goalsByPlayer, [player._id]: parseInt(e.target.value) || 0}
                  })}
                />
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: '15px' }}>Jugadores que Participaron</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '25px' }}>
            {players.map(player => (
              <div key={player._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.playersPlayed.includes(player._id)}
                  onChange={() => togglePlayerPlayed(player._id)}
                />
                <label>{player.name}</label>
              </div>
            ))}
          </div>

          <button type="submit" className="btn" style={{ width: '100%', padding: '15px', fontSize: '16px' }}>
            💾 Guardar Partido
          </button>
        </form>
      )}
    </div>
  );
};

export default AddMatch;

