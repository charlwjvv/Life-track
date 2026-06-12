import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data) return <div className="error-message">No data available</div>;

  const progressColor = data.progressPercent >= 80 ? 'green' : data.progressPercent >= 50 ? 'yellow' : 'accent';

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Your training and nutrition at a glance</p>
      </div>

      {/* Injury Banner */}
      {data.injuryStatus && data.injuryStatus !== 'healthy' && (
        <div className="phase-banner injury" style={{ marginBottom: 20 }}>
          <strong>
            {data.injuryStatus === 'injured' ? '🛑 Injured' : data.injuryStatus === 'recovering' ? '🔄 Recovering' : '⚠️ Niggle'}
          </strong>
          {data.injuryType && <span> — {data.injuryType}</span>}
          {data.injuryNotes && <div style={{ marginTop: 4, opacity: 0.9, fontSize: 13 }}>{data.injuryNotes}</div>}
          <div style={{ marginTop: 6 }}>
            <Link to="/profile" style={{ textDecoration: 'underline', opacity: 0.8, fontSize: 13 }}>
              Update injury status →
            </Link>
          </div>
        </div>
      )}

      {/* Goal Badge */}
      {data.isUltraGoal && (
        <div className="stat-card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, #1a1a3e, #0f0f23)', border: '1px solid #8b5cf640' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span className="stat-label">{data.goalLabel || 'Ultra Training'}</span>
              <div style={{ fontSize: 12, marginTop: 2, opacity: 0.6 }}>Back-to-back long runs · Time on feet · Nutrition practice</div>
            </div>
            <span style={{ fontSize: 24 }}>🏔️</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid-4 section">
        <div className="stat-card">
          <div className="stat-label">This Week</div>
          <div className="stat-value">{data.weeklyKm}<span className="unit">km</span></div>
          <div className={`stat-trend ${data.trendDirection}`}>
            {data.trendDirection === 'up' ? '↑' : data.trendDirection === 'down' ? '↓' : '→'} {data.trendAmount}km vs last 4wk avg
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Runs</div>
          <div className="stat-value">{data.runCount}<span className="unit">/{data.runCount + 2}+</span></div>
          <div className="stat-trend stable">{data.totalMinutes} min total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Pace</div>
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: 22 }}>{data.avgPace}</div>
          <div className="stat-trend stable">{data.avgHr > 0 ? `${data.avgHr} bpm avg` : 'No HR data'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Weekly Goal</div>
          <div className="stat-value">{data.weeklyGoal}<span className="unit">km</span></div>
          <div className="progress-bar">
            <div className={`progress-fill ${progressColor}`} style={{ width: `${data.progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Today's Nutrition Preview */}
      {data.nutrition && (
        <div className="section">
          <h3 className="section-title">Today's Nutrition Plan</h3>
          <div className="grid-2">
            {data.nutrition.preRun?.length > 0 && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>🏃 Pre-Run Fuel</div>
                {data.nutrition.preRun.map((rec: any, i: number) => (
                  <div key={i} className="tip-card" style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{rec.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec.content}</div>
                  </div>
                ))}
              </div>
            )}
            {data.nutrition.mealPlan?.meals?.length > 0 && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>🥗 Meal Suggestions</div>
                {data.nutrition.mealPlan.meals.slice(0, 3).map((meal: any, i: number) => (
                  <div key={i} className="tip-card" style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{meal.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--yellow)' }}>{meal.calories} cal</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{meal.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Runs */}
      <div className="section">
        <div className="card-header">
          <h3 className="section-title" style={{ margin: 0 }}>Recent Runs</h3>
          <Link to="/runs" className="btn btn-sm btn-secondary">Log Run</Link>
        </div>
        {data.recentRuns?.length > 0 ? (
          <div>
            {data.recentRuns.map((run: any) => (
              <div key={run.id} className="day-plan completed">
                <div className="day-name">{new Date(run.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div className="day-info">
                  <div className="day-type">{run.type.charAt(0).toUpperCase() + run.type.slice(1)}</div>
                  <div className="day-desc">{run.distance.toFixed(1)}km · {Math.round(run.duration)}min</div>
                </div>
                <div className="day-stats">
                  <div>{run.pace}</div>
                  <div className="day-hr">{run.hr ? `${Math.round(run.hr)} bpm` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🏃</div>
            <h3>No runs this week</h3>
            <p>Log your first run or connect Strava to get started.</p>
            <Link to="/runs" className="btn btn-primary">Log a Run</Link>
          </div>
        )}
      </div>
    </div>
  );
}
