import React, { useState, useEffect, FormEvent } from 'react';
import { api } from '../api';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [goalType, setGoalType] = useState('general');
  const [weeklyGoalKm, setWeeklyGoalKm] = useState('20');
  const [weightKg, setWeightKg] = useState('70');
  const [maxHeartRate, setMaxHeartRate] = useState('');
  const [restingHeartRate, setRestingHeartRate] = useState('');
  const [birthYear, setBirthYear] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const p = await api.getProfile();
      setProfile(p);
      setName(p.name || '');
      setExperienceLevel(p.experienceLevel || 'beginner');
      setGoalType(p.goalType || 'general');
      setWeeklyGoalKm(String(p.weeklyGoalKm || 20));
      setWeightKg(String(p.weightKg || ''));
      setMaxHeartRate(String(p.maxHr || ''));
      setRestingHeartRate(String(p.restingHr || ''));
      setBirthYear(String(p.birthYear || ''));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await api.updateProfile({
        name: name || undefined,
        experienceLevel,
        goalType,
        weeklyGoalKm: parseFloat(weeklyGoalKm) || 20,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        maxHeartRate: maxHeartRate ? parseInt(maxHeartRate) : undefined,
        restingHeartRate: restingHeartRate ? parseInt(restingHeartRate) : undefined,
        birthYear: birthYear ? parseInt(birthYear) : undefined,
      });
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading profile...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Profile & Settings</h2>
        <p>Configure your coaching profile for personalized plans</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="toast success">{success}</div>}

      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Experience Level</label>
              <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}>
                <option value="beginner">Beginner — new to running</option>
                <option value="intermediate">Intermediate — can run 5-10km</option>
                <option value="advanced">Advanced — training for races</option>
              </select>
            </div>
            <div className="form-group">
              <label>Training Goal</label>
              <select value={goalType} onChange={e => setGoalType(e.target.value)}>
                <option value="general">General fitness</option>
                <option value="5k">5K race</option>
                <option value="10k">10K race</option>
                <option value="half_marathon">Half Marathon</option>
                <option value="marathon">Marathon</option>
                <option value="speed">Speed improvement</option>
                <option value="weight_loss">Weight loss</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Weekly Goal (km)</label>
              <input type="number" step="0.5" min="5" value={weeklyGoalKm} onChange={e => setWeeklyGoalKm(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input type="number" step="0.1" min="30" max="300" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Max Heart Rate</label>
              <input type="number" min="100" max="250" value={maxHeartRate} onChange={e => setMaxHeartRate(e.target.value)} placeholder={`Estimated: ${profile?.maxHr || 190}`} />
            </div>
            <div className="form-group">
              <label>Resting Heart Rate</label>
              <input type="number" min="30" max="100" value={restingHeartRate} onChange={e => setRestingHeartRate(e.target.value)} placeholder="e.g. 60" />
            </div>
          </div>

          <div className="form-group">
            <label>Birth Year</label>
            <input type="number" min="1950" max="2010" value={birthYear} onChange={e => setBirthYear(e.target.value)} placeholder="Optional, used for HR zones" />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* HR Zone Reference */}
      <div className="card" style={{ marginTop: 24, maxWidth: 600 }}>
        <h3 className="card-title" style={{ marginBottom: 12 }}>❤️ Your Heart Rate Zones</h3>
        {profile?.maxHr ? (
          <div style={{ fontSize: 14, lineHeight: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: '#3b82f6' }}>Zone 1 (Recovery):</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(profile.maxHr * 0.5)}-{Math.round(profile.maxHr * 0.6)} bpm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid var(--border)' }}>
              <span style={{ color: '#22c55e' }}>Zone 2 (Aerobic):</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(profile.maxHr * 0.6)}-{Math.round(profile.maxHr * 0.7)} bpm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid var(--border)' }}>
              <span style={{ color: '#eab308' }}>Zone 3 (Tempo):</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(profile.maxHr * 0.7)}-{Math.round(profile.maxHr * 0.8)} bpm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid var(--border)' }}>
              <span style={{ color: '#f97316' }}>Zone 4 (Threshold):</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(profile.maxHr * 0.8)}-{Math.round(profile.maxHr * 0.9)} bpm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid var(--border)' }}>
              <span style={{ color: '#ef4444' }}>Zone 5 (Max):</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(profile.maxHr * 0.9)}-{profile.maxHr} bpm</span>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Set your max heart rate or birth year to see your personalized HR zones. Without it, we estimate based on the Tanaka formula (208 - 0.7 x age).
          </p>
        )}
      </div>
    </div>
  );
}
