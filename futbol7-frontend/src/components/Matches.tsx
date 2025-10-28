import React, { useEffect, useState } from 'react';
import { matchAPI } from '../api/client';
import { useNavigate } from 'react-router-dom';

interface Match {
  _id: string;
  date: string;
  opponent: string;
  result: 'Victoria' | 'Derrota' | 'Empate';
  score: string;
}

interface MatchesProps {
  league: string;
}

const Matches: React.FC<MatchesProps> = ({ league }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadMatches();
  }, [league]);

  const loadMatches = async () => {
    try {
      const res = await matchAPI.getAll(league);
      const sortedMatches = res.data.sort((a: Match, b: Match) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMatches(sortedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
      setMatches([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres borrar este partido?')) {
      try {
        await matchAPI.delete(id);
        loadMatches();
      } catch (error) {
        console.error('Error deleting match:', error);
        alert('Error al borrar el partido.');
      }
    }
  };

  return (
    <div className="tab-content">
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2>Historial de Partidos</h2>
        <button className="btn" onClick={() => navigate('/add-match')}>➕ Agregar Partido</button>
      </div>

      {matches.length === 0 ? (
        <p className="text-center">No hay partidos registrados para la liga {league}.</p>
      ) : (
        <div className="matches-list">
          {matches.map(match => (
            <div key={match._id} className="match-card">
              <div className="match-card-header">
                <span>{new Date(match.date).toLocaleDateString()}</span>
                <span className={`match-result ${match.result.toLowerCase()}`}>{match.result}</span>
              </div>
              <div className="match-card-body">
                <div className="team-info">
                  <span className="team-name">Aspastecos</span>
                  <span className="score">{match.score.split('-')[0]}</span>
                </div>
                <div className="vs">VS</div>
                <div className="team-info opponent">
                  <span className="score">{match.score.split('-')[1]}</span>
                  <span className="team-name">{match.opponent}</span>
                </div>
              </div>
              <div className="match-card-footer">
                <button className="btn btn-sm" onClick={() => navigate(`/edit-match/${match._id}`)}>
                  ✏️ Editar
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(match._id)}>
                  🗑️ Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;