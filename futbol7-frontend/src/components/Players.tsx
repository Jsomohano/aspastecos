import React, { useEffect, useState } from 'react';
import { playerAPI } from '../api/client';

interface Player {
  _id: string;
  name: string;
  position: string;
  number?: string;
  goals: number;
  matchesPlayed: number;
}

const Players: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', position: 'Portero', number: '' });

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
    try {
      await playerAPI.create(formData);
      setShowModal(false);
      setFormData({ name: '', position: 'Portero', number: '' });
      loadPlayers();
    } catch (error) {
      console.error('Error creating player:', error);
      alert('Error al agregar jugador');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Borrar este jugador?')) {
      try {
        await playerAPI.delete(id);
        loadPlayers();
      } catch (error) {
        console.error('Error deleting player:', error);
      }
    }
  };

  return (
    <div className="tab-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2>Jugadores del Equipo</h2>
        <button className="btn" onClick={() => setShowModal(true)}>➕ Agregar Jugador</button>
      </div>

      {players.length === 0 ? (
        <p className="text-center">No hay jugadores registrados.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {players.map(player => (
            <div key={player._id} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
              <h3>{player.name}</h3>
              <p><strong>Posición:</strong> {player.position}</p>
              <p><strong>Número:</strong> {player.number || 'Sin número'}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                <div style={{ textAlign: 'center', padding: '10px', background: 'white', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{player.goals}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>Goles</div>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', background: 'white', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{player.matchesPlayed}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>Partidos</div>
                </div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(player._id)} style={{ marginTop: '10px', width: '100%' }}>
                🗑️ Borrar
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ marginBottom: '20px' }}>Agregar Nuevo Jugador</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Jugador</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Posición</label>
                <select value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})}>
                  <option value="Portero">Portero</option>
                  <option value="Defensa">Defensa</option>
                  <option value="Medio">Medio</option>
                  <option value="Delantero">Delantero</option>
                </select>
              </div>
              <div className="form-group">
                <label>Número de Camiseta</label>
                <input type="number" min="1" max="99" value={formData.number} onChange={(e) => setFormData({...formData, number: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn">✅ Agregar</button>
                <button type="button" className="btn btn-danger" onClick={() => setShowModal(false)}>❌ Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;

