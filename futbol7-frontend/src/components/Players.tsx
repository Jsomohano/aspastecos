import React, { useEffect, useMemo, useState } from 'react';
import { playerAPI } from '../api/client';

// Interface actualizada, 'leagues' es un array
interface Player {
  _id: string;
  name: string;
  position: string;
  number?: string;
  goals: number;
  matchesPlayed: number;
  leagues: string[];
}

interface PlayersProps {
  league: string;
}

type SortOption = 'name' | 'goals' | 'matchesPlayed';

const Players: React.FC<PlayersProps> = ({ league }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', position: 'Portero', number: '', leagues: [league] });
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('name'); // Estado para el ordenamiento

  useEffect(() => {
    loadPlayers();
  }, [league]);

  const loadPlayers = async () => {
    try {
      const res = await playerAPI.getAll(league);
      setPlayers(res.data);
    } catch (error) {
      console.error('Error loading players:', error);
      setPlayers([]);
    }
  };
  
  // Lógica para abrir el modal en modo edición
  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({ name: player.name, position: player.position, number: player.number || '', leagues: player.leagues });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlayer(null);
    setFormData({ name: '', position: 'Portero', number: '', leagues: [league] });
  };
  
  // Lógica para manejar el cambio de ligas en el formulario
  const handleLeagueChange = (selectedLeague: string) => {
    const newLeagues = formData.leagues.includes(selectedLeague)
      ? formData.leagues.filter(l => l !== selectedLeague)
      : [...formData.leagues, selectedLeague];
    setFormData({ ...formData, leagues: newLeagues });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.leagues.length === 0) {
      alert('El jugador debe pertenecer al menos a una liga.');
      return;
    }
    try {
      if (editingPlayer) {
        await playerAPI.update(editingPlayer._id, formData);
      } else {
        await playerAPI.create(formData);
      }
      handleCloseModal();
      loadPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
      alert('Error al guardar jugador');
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

  // Memoizamos la lista ordenada para que no se recalcule en cada render
  const sortedPlayers = useMemo(() => {
    const sorted = [...players];
    switch (sortOption) {
      case 'goals':
        return sorted.sort((a, b) => b.goals - a.goals);
      case 'matchesPlayed':
        return sorted.sort((a, b) => b.matchesPlayed - a.matchesPlayed);
      case 'name':
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [players, sortOption]);

  return (
    <div className="tab-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2>Jugadores del Equipo</h2>
        <button className="btn" onClick={() => setShowModal(true)}>➕ Agregar Jugador</button>
      </div>

      <div className="sort-options" style={{ marginBottom: '25px', textAlign: 'right' }}>
        <label htmlFor="sort">Ordenar por: </label>
        <select id="sort" value={sortOption} onChange={(e) => setSortOption(e.target.value as SortOption)}>
          <option value="name">Nombre (A-Z)</option>
          <option value="goals">Goles</option>
          <option value="matchesPlayed">Partidos Jugados</option>
        </select>
      </div>

      {sortedPlayers.length === 0 ? (
        <p className="text-center">No hay jugadores registrados para la liga {league}.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {sortedPlayers.map(player => (
            <div key={player._id} className="player-card">
              <img src="https://api.dicebear.com/8.x/initials/svg?seed=user" alt="Foto de perfil" className="player-photo" />
              <h3>{player.name}</h3>
              <p><strong>Posición:</strong> {player.position}</p>
              <p><strong>Número:</strong> {player.number || 'S/N'}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                <div className="stat-box">
                  <div className="stat-value">{player.goals}</div>
                  <div className="stat-label">Goles</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{player.matchesPlayed}</div>
                  <div className="stat-label">Partidos</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="btn btn-sm" onClick={() => handleEdit(player)} style={{ flexGrow: 1 }}>✏️ Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(player._id)} style={{ flexGrow: 1 }}>🗑️ Borrar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>{editingPlayer ? 'Editar Jugador' : 'Agregar Nuevo Jugador'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Jugador</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Posición</label>
                <select value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })}>
                  <option value="Portero">Portero</option>
                  <option value="Defensa">Defensa</option>
                  <option value="Medio">Medio</option>
                  <option value="Delantero">Delantero</option>
                </select>
              </div>
              <div className="form-group">
                <label>Número de Camiseta</label>
                <input type="number" min="1" max="99" value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Ligas en las que participa</label>
                <div className="checkbox-group">
                  <div>
                    <input type="checkbox" id="fut7" value="Fut-7" checked={formData.leagues.includes('Fut-7')} onChange={() => handleLeagueChange('Fut-7')} />
                    <label htmlFor="fut7">Fut-7</label>
                  </div>
                  <div>
                    <input type="checkbox" id="fut5" value="Fut-5" checked={formData.leagues.includes('Fut-5')} onChange={() => handleLeagueChange('Fut-5')} />
                    <label htmlFor="fut5">Fut-5</label>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn">✅ {editingPlayer ? 'Guardar Cambios' : 'Agregar'}</button>
                <button type="button" className="btn btn-danger" onClick={handleCloseModal}>❌ Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;