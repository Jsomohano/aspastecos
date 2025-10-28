import { useEffect, useState } from 'react';
import { playerAPI, matchAPI } from '../api/client';

interface Player {
  _id: string;
  name: string;
  position: string;
  number?: string;
  goals: number;
  matchesPlayed: number;
}

interface Match {
  _id: string;
  date: string;
  opponent: string;
  result: 'Victoria' | 'Derrota' | 'Empate';
  score: string;
}

interface DashboardProps {
  league: string;
}

const Dashboard: React.FC<DashboardProps> = ({ league }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [league]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [playersRes, matchesRes] = await Promise.all([
        playerAPI.getAll(league),
        matchAPI.getAll(league)
      ]);
      setPlayers(playersRes.data);
      setMatches(matchesRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setPlayers([]);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const topScorers = [...players].sort((a, b) => b.goals - a.goals).slice(0, 5);
  const mostMatchesPlayed = [...players].sort((a, b) => b.matchesPlayed - a.matchesPlayed).slice(0, 5);
  
  const teamStats = {
    wins: matches.filter(m => m.result === 'Victoria').length,
    draws: matches.filter(m => m.result === 'Empate').length,
    losses: matches.filter(m => m.result === 'Derrota').length,
  };

  const lastMatch = matches.length > 0 ? matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

  if (loading) {
    return <div className="text-center">Cargando datos del dashboard...</div>;
  }

  return (
    <div className="tab-content">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Team Stats */}
        <div className="dashboard-card">
          <h3>Rendimiento del Equipo</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginTop: '15px' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{teamStats.wins}</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Victorias</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>{teamStats.draws}</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Empates</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger-color)' }}>{teamStats.losses}</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Derrotas</div>
            </div>
          </div>
        </div>

        {/* Last Match */}
        <div className="dashboard-card">
          <h3>Último Partido</h3>
          {lastMatch ? (
            <div>
              <p><strong>Rival:</strong> {lastMatch.opponent}</p>
              <p><strong>Resultado:</strong> {lastMatch.result} ({lastMatch.score})</p>
              <p><strong>Fecha:</strong> {new Date(lastMatch.date).toLocaleDateString()}</p>
            </div>
          ) : (
            <p>No hay partidos registrados.</p>
          )}
        </div>

        {/* Top Scorers */}
        <div className="dashboard-card">
          <h3>Máximos Goleadores</h3>
          {topScorers.length > 0 ? (
            <ol style={{ paddingLeft: '20px' }}>
              {topScorers.map(player => (
                <li key={player._id} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{player.name}</span>
                  <strong>{player.goals}</strong>
                </li>
              ))}
            </ol>
          ) : (
            <p>No hay datos de goles.</p>
          )}
        </div>

        {/* Most Matches Played */}
        <div className="dashboard-card">
          <h3>Más Participaciones</h3>
          {mostMatchesPlayed.length > 0 ? (
            <ol style={{ paddingLeft: '20px' }}>
              {mostMatchesPlayed.map(player => (
                <li key={player._id} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{player.name}</span>
                  <strong>{player.matchesPlayed}</strong>
                </li>
              ))}
            </ol>
          ) : (
            <p>No hay datos de partidos jugados.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;