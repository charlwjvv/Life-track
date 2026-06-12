import React, { useState, FormEvent, useEffect } from 'react';
import { api } from '../api';

export default function RunLogger() {
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [runType, setRunType] = useState('easy');
  const [effort, setEffort] = useState('5');
  const [notes, setNotes] = useState('');
  const [runDate, setRunDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stravaStatus, setStravaStatus] = useState<any>(null);

  useEffect(() => {
    api.getStravaStatus().then(setStravaStatus).catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.logRun({
        distanceKm: parseFloat(distance),
        durationMinutes: parseFloat(duration),
        runType,
        perceivedEffort: parseInt(effort),
        notes,
        runDate,
      });
      setSuccess('Run logged successfully!');
      setDistance('');
      setDuration('');
      setNotes('');
      // Refresh Strava stats
      api.getStravaStatus().then(setStravaStatus).catch(() => {});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Log a Run</h2>
        <p>Record your training manually</p>
      </div>

      {stravaStatus && (
        <div className="stat-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-label">Strava Connection</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>
                {stravaStatus.connected
                  ? `✅ Connected · ${stravaStatus.totalRuns} runs synced`
                  : 'Not connected — runs here are manual only'}
              </div>
            </div>
            {stravaStatus.connected && (
              <span className="tag tag-green">Connected</span>
            )}
          </div>
        </div>
      )}

      <div className="card" style={{ maxWidth: 560 }}>
        <h3 className="card-title" style={{ marginBottom: 20 }}>Manual Run Entry</h3>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="toast success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Distance (km)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                placeholder="e.g. 5.2"
                required
              />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                step="1"
                min="1"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="e.g. 30"
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Run Type</label>
              <select value={runType} onChange={e => setRunType(e.target.value)}>
                <option value="easy">Easy Run</option>
                <option value="tempo">Tempo Run</option>
                <option value="interval">Interval</option>
                <option value="long_run">Long Run</option>
                <option value="recovery">Recovery Run</option>
                <option value="fartlek">Fartlek</option>
                <option value="race">Race</option>
              </select>
            </div>
            <div className="form-group">
              <label>Perceived Effort (1-10)</label>
              <select value={effort} onChange={e => setEffort(e.target.value)}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <option key={n} value={n}>{n} — {n <= 2 ? 'Very Easy' : n <= 4 ? 'Easy' : n <= 5 ? 'Moderate' : n <= 7 ? 'Hard' : n <= 9 ? 'Very Hard' : 'Max Effort'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={runDate}
              onChange={e => setRunDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How did it feel? Weather? Route?"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={saving || !distance || !duration}>
            {saving ? 'Saving...' : '🏃 Log Run'}
          </button>
        </form>
      </div>

      {/* Quick Pace Calculator */}
      <div className="card" style={{ marginTop: 24, maxWidth: 560 }}>
        <h3 className="card-title" style={{ marginBottom: 12 }}>⏱ Pace Reference</h3>
        {distance && duration && parseFloat(distance) > 0 && parseFloat(duration) > 0 && (
          <div style={{ fontSize: 14 }}>
            Your pace: <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)' }}>
              {formatPace(parseFloat(distance), parseFloat(duration))}
            </strong> /km
          </div>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          Easy: 6:00-7:00 · Tempo: 5:00-5:30 · Interval: 4:00-4:30 · Recovery: 6:30-7:30
        </div>
      </div>
    </div>
  );
}

function formatPace(distanceKm: number, durationMin: number): string {
  const paceMinPerKm = durationMin / distanceKm;
  const min = Math.floor(paceMinPerKm);
  const sec = Math.round((paceMinPerKm - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}
