import React, { useEffect, useState } from 'react';
import { matchAPI } from '../api/client';

interface Match {
  _id: string;
  date: string;
  opponent: string;
  ourGoals: number;
  opponentGoals: number;
  leaguePosition?: number;
}

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const res = await matchAPI.getAll();
      setMatches(res.data);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Borrar este partido?')) {
      try {
        await matchAPI.delete(id);
        loadMatches();
      } catch (error) {
        console.error('Error deleting match:', error);
      }
    }
  };

  return (
    <div className="tab-content">
      <h2>Historial de Partidos</h2>
      {matches.length === 0 ? (
        <p className="text-center">No hay partidos registrados.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(match => {
            const result = match.ourGoals > match.opponentGoals ? 'Victoria' : 
                          match.ourGoals < match.opponentGoals ? 'Derrota' : 'Empate';
            const resultColor = match.ourGoals > match.opponentGoals ? 'var(--success-color)' : 
                               match.ourGoals < match.opponentGoals ? 'var(--danger-color)' : 'var(--warning-color)';
            
            return (
              <div key={match._id} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <span>{new Date(match.date).toLocaleDateString('es-ES')}</span>
                  <span style={{ fontWeight: 'bold', color: resultColor }}>{result}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(match._id)}>🗑️</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                  <div style={{ textAlign: 'center', padding: '10px', background: 'white', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Rival</div>
                    <div style={{ fontWeight: 'bold' }}>{match.opponent}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', background: 'white', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Resultado</div>
                    <div style={{ fontWeight: 'bold' }}>{match.ourGoals} - {match.opponentGoals}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', background: 'white', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Posición Liga</div>
                    <div style={{ fontWeight: 'bold' }}>{match.leaguePosition || 'N/A'}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Matches;

