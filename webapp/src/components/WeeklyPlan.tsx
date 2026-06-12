import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function WeeklyPlan() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    loadPlan();
  }, [weekOffset]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const res = await api.getWeeklyPlan(weekOffset);
      setPlan(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /> Generating your training plan...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!plan) return <div className="error-message">No plan available</div>;

  const phaseClass = plan.phase?.toLowerCase().replace(' ', '-') || 'build';

  const progressColor = plan.progress >= 80 ? 'green' : plan.progress >= 50 ? 'yellow' : 'accent';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h2>Training Plan</h2>
          <p>Week {weekOffset === 0 ? 'this week' : weekOffset < 0 ? `${Math.abs(weekOffset)} weeks ago` : `${weekOffset} weeks ahead`}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm btn-secondary" onClick={() => setWeekOffset(w => w - 1)} disabled={weekOffset <= -12}>
            ← Previous
          </button>
          {weekOffset !== 0 && <button className="btn btn-sm btn-secondary" onClick={() => setWeekOffset(0)}>Current</button>}
          <button className="btn btn-sm btn-secondary" onClick={() => setWeekOffset(w => w + 1)} disabled={weekOffset >= 12}>
            Next →
          </button>
        </div>
      </div>

      {/* Phase Banner */}
      <div className={`phase-banner ${phaseClass}`}>
        <strong>{plan.phase} — Week {plan.weekInCycle} of 4</strong>
        <div style={{ marginTop: 4, opacity: 0.9 }}>{plan.reasoning}</div>
      </div>

      {/* Progress */}
      <div className="stat-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span className="stat-label">Weekly Progress</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {plan.completedKm}km / {plan.totalPlannedKm}km completed
          </span>
        </div>
        <div className="progress-bar">
          <div className={`progress-fill ${progressColor}`} style={{ width: `${plan.progress}%` }} />
        </div>
      </div>

      {/* Day Plans */}
      <h3 className="section-title">Daily Workouts</h3>
      {plan.plan?.map((day: any, i: number) => (
        <div key={i} className={`day-plan ${day.completed ? 'completed' : ''} ${day.type === 'Rest' ? 'rest' : ''}`}>
          <div className="day-name">{day.day}</div>
          {day.type === 'Rest' ? (
            <div className="day-info">
              <div className="day-type">Rest</div>
              <div className="day-desc">{day.description}</div>
            </div>
          ) : (
            <div className="day-info">
              <div className="day-type">
                {day.type}
                {day.completed && <span className="tag tag-green" style={{ marginLeft: 8 }}>✓ Done</span>}
              </div>
              <div className="day-desc">{day.description}</div>
              {day.notes && <div className="day-hr" style={{ marginTop: 2 }}>{day.notes}</div>}
            </div>
          )}
          <div className="day-stats">
            {day.distanceKm && <div>{day.distanceKm.toFixed(1)}km</div>}
            {day.durationMin && <div>{day.durationMin}min</div>}
            <div className="day-hr">{day.hrZone}</div>
            <div className="day-hr">{day.targetHrRange}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
