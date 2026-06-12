import React, { useState, useEffect } from 'react';
import { api } from '../api';
import MileageTrendChart from './Charts/MileageTrendChart';
import PaceDistribution from './Charts/PaceDistribution';
import WorkoutBreakdown from './Charts/WorkoutBreakdown';
import HrZonesChart from './Charts/HrZonesChart';

export default function Analytics() {
  const [mileageData, setMileageData] = useState<any[]>([]);
  const [paceData, setPaceData] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [hrData, setHrData] = useState<any[]>([]);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [mileage, pace, workout, hr, nutrition] = await Promise.all([
        api.getMileageTrend(12),
        api.getPaceDistribution(),
        api.getWorkoutBreakdown(),
        api.getHrZones(),
        api.getNutritionAnalytics(),
      ]);
      setMileageData(mileage);
      setPaceData(pace);
      setWorkoutData(workout);
      setHrData(hr);
      setNutritionData(nutrition);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading analytics...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Track your progress with data-driven insights</p>
      </div>

      <div className="grid-2 section">
        <MileageTrendChart data={mileageData} />
        <HrZonesChart data={hrData} />
      </div>

      <div className="grid-2 section">
        <PaceDistribution data={paceData} />
        <WorkoutBreakdown data={workoutData} />
      </div>

      {/* Nutrition Analytics */}
      {nutritionData && (
        <div className="section">
          <h3 className="section-title">Nutrition Overview</h3>
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <div className="stat-label">Avg Daily Calories</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{nutritionData.averageDailyCalories || '—'}</div>
              </div>
              <div>
                <div className="stat-label">Protein</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--red)' }}>{nutritionData.averageProtein || '—'}g</div>
              </div>
              <div>
                <div className="stat-label">Carbs</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--yellow)' }}>{nutritionData.averageCarbs || '—'}g</div>
              </div>
              <div>
                <div className="stat-label">Fat</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--blue)' }}>{nutritionData.averageFat || '—'}g</div>
              </div>
            </div>
            {nutritionData.recommendation && (
              <div className="tip-reasoning">💡 {nutritionData.recommendation}</div>
            )}
          </div>
        </div>
      )}

      {/* Training Summary */}
      {workoutData.length > 0 && (
        <div className="section">
          <h3 className="section-title">Training Summary</h3>
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>Workout Type</th>
                  <th>Sessions</th>
                  <th>Total Distance</th>
                  <th>Total Time</th>
                </tr>
              </thead>
              <tbody>
                {workoutData.map((item: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{item.type}</td>
                    <td>{item.count}</td>
                    <td>{item.totalKm}km</td>
                    <td>{item.totalMin}min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
