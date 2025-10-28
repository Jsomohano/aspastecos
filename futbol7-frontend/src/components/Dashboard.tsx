import React, { useEffect, useState } from 'react';
import { playerAPI, matchAPI } from '../api/client';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  ourGoals: number;
  opponentGoals: number;
  leaguePosition?: number;
}

const Dashboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const playersRes = await playerAPI.getAll();
      const matchesRes = await matchAPI.getAll();
      setPlayers(playersRes.data);
      setMatches(matchesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const totalGoals = players.reduce((sum, p) => sum + p.goals, 0);
  const victories = matches.filter(m => m.ourGoals > m.opponentGoals).length;
  const winRate = matches.length > 0 ? Math.round((victories / matches.length) * 100) : 0;
  
  const lastMatch = matches.length > 0 
    ? matches.reduce((latest, match) => 
        new Date(match.date) > new Date(latest.date) ? match : latest
      ) 
    : null;
  const teamPosition = lastMatch && lastMatch.leaguePosition ? lastMatch.leaguePosition : '-';

  const goalsData = {
    labels: players.map(p => p.name),
    datasets: [{
      label: 'Goles',
      data: players.map(p => p.goals),
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 1,
    }],
  };

  const matchesData = {
    labels: players.map(p => p.name),
    datasets: [{
      label: 'Partidos Jugados',
      data: players.map(p => p.matchesPlayed),
      backgroundColor: 'rgba(118, 75, 162, 0.8)',
      borderColor: 'rgba(118, 75, 162, 1)',
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="tab-content">
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card" style={{ background: 'var(--primary-gradient)', color: 'white', padding: '25px', borderRadius: '15px' }}>
          <h3>{matches.length}</h3>
          <p>Partidos Jugados</p>
        </div>
        <div className="stat-card" style={{ background: 'var(--primary-gradient)', color: 'white', padding: '25px', borderRadius: '15px' }}>
          <h3>{teamPosition}</h3>
          <p>Posición en Liga</p>
        </div>
        <div className="stat-card" style={{ background: 'var(--primary-gradient)', color: 'white', padding: '25px', borderRadius: '15px' }}>
          <h3>{totalGoals}</h3>
          <p>Goles Totales</p>
        </div>
        <div className="stat-card" style={{ background: 'var(--primary-gradient)', color: 'white', padding: '25px', borderRadius: '15px' }}>
          <h3>{winRate}%</h3>
          <p>% Victorias</p>
        </div>
      </div>

      <div className="charts-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '30px' }}>
        <div className="chart-container" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
          <h3>Goles por Jugador</h3>
          {players.length > 0 && <Bar data={goalsData} options={options} />}
        </div>
        <div className="chart-container" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
          <h3>Partidos Jugados por Jugador</h3>
          {players.length > 0 && <Bar data={matchesData} options={options} />}
        </div>
      </div>

      <div className="recent-matches">
        <h3>Últimos Partidos</h3>
        {matches.length === 0 ? (
          <p className="text-center">No hay partidos registrados.</p>
        ) : (
          <div className="matches-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            {matches
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map(match => {
                const result = match.ourGoals > match.opponentGoals ? 'Victoria' : 
                              match.ourGoals < match.opponentGoals ? 'Derrota' : 'Empate';
                const resultColor = match.ourGoals > match.opponentGoals ? 'var(--success-color)' : 
                                   match.ourGoals < match.opponentGoals ? 'var(--danger-color)' : 'var(--warning-color)';
                
                return (
                  <div key={match._id} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span>{new Date(match.date).toLocaleDateString('es-ES')}</span>
                      <span style={{ fontWeight: 'bold', color: resultColor }}>{result}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Rival</div>
                        <div style={{ fontWeight: 'bold' }}>{match.opponent}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Resultado</div>
                        <div style={{ fontWeight: 'bold' }}>{match.ourGoals} - {match.opponentGoals}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

