import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function NutritionCoach() {
  const [data, setData] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNutrition();
  }, []);

  const loadNutrition = async () => {
    try {
      setLoading(true);
      const [nutrition, savedMeals] = await Promise.all([
        api.getNutrition(),
        api.getMealPlan().catch(() => []),
      ]);
      setData(nutrition);
      setMealPlan(savedMeals.length > 0 ? { meals: savedMeals } : null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async () => {
    setGenerating(true);
    setError('');
    try {
      const plan = await api.generateMealPlan();
      setMealPlan(plan);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading nutrition coach...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h2>Nutrition Coach</h2>
          <p>Fuel your training — pre-run, post-run, and daily meals</p>
        </div>
        <button className="btn btn-primary" onClick={generateMealPlan} disabled={generating}>
          {generating ? 'Generating...' : '🥗 Generate Meal Plan'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Calorie Summary */}
      {data?.todayCalories && (
        <div className="grid-2 section">
          <div className="stat-card">
            <div className="stat-label">Today's Calories</div>
            <div className="stat-value">
              {data.todayCalories.total}<span className="unit"> / {data.todayCalories.goal}</span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${data.todayCalories.total > data.todayCalories.goal ? 'yellow' : 'green'}`}
                style={{ width: `${Math.min(100, (data.todayCalories.total / data.todayCalories.goal) * 100)}%` }}
              />
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Today's Runs</div>
            <div className="stat-value">
              {data.mealPlan?.totalCalories || 0}<span className="unit">cal planned</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              P: {data.mealPlan?.totalProtein || 0}g · C: {data.mealPlan?.totalCarbs || 0}g · F: {data.mealPlan?.totalFat || 0}g
            </div>
          </div>
        </div>
      )}

      {/* Pre-Run Fueling */}
      {data?.preRun?.length > 0 && (
        <div className="section">
          <h3 className="section-title">🏃 Pre-Run Fueling</h3>
          <div className="grid-2">
            {data.preRun.map((rec: any, i: number) => (
              <div key={i} className="card">
                <div className="card-title" style={{ marginBottom: 8 }}>{rec.title}</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{rec.content}</p>
                {rec.reasoning && (
                  <div className="tip-reasoning">🔬 {rec.reasoning}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meal Plan */}
      {mealPlan?.meals?.length > 0 ? (
        <div className="section">
          <h3 className="section-title">Today's Meal Plan</h3>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span>🔥 {mealPlan.totalCalories} cal</span>
              <span style={{ color: 'var(--red)' }}>P: {mealPlan.totalProtein}g</span>
              <span style={{ color: 'var(--yellow)' }}>C: {mealPlan.totalCarbs}g</span>
              <span style={{ color: 'var(--blue)' }}>F: {mealPlan.totalFat}g</span>
            </div>
            {mealPlan.reasoning && (
              <div className="tip-reasoning" style={{ marginTop: 12 }}>🔬 {mealPlan.reasoning}</div>
            )}
          </div>
          {mealPlan.meals.map((meal: any, i: number) => (
            <div key={i} className="meal-card">
              <div className="meal-header">
                <div>
                  <span className="tag tag-blue" style={{ marginBottom: 4, display: 'inline-block' }}>{meal.mealType}</span>
                  <div className="meal-name">{meal.name}</div>
                </div>
                <div className="meal-calories">{meal.calories} cal</div>
              </div>
              <div className="meal-desc">{meal.description}</div>
              <div className="meal-macros">
                <span>P {meal.proteinG}g</span>
                <span>C {meal.carbsG}g</span>
                <span>F {meal.fatG}g</span>
              </div>
              <div className="meal-reasoning">🔬 {meal.reasoning}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🥗</div>
          <h3>No meal plan yet</h3>
          <p>Generate a personalized meal plan based on today's training load.</p>
          <button className="btn btn-primary" onClick={generateMealPlan} disabled={generating}>
            {generating ? 'Generating...' : 'Generate Meal Plan'}
          </button>
        </div>
      )}

      {/* Saved Recommendations */}
      {data?.savedRecommendations?.length > 0 && (
        <div className="section">
          <h3 className="section-title">Saved Nutrition Advice</h3>
          {data.savedRecommendations.slice(0, 5).map((rec: any, i: number) => (
            <div key={i} className="tip-card">
              <div className="tip-header">
                <span className="tag tag-green">{rec.category}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{rec.title}</div>
              <div className="tip-content" style={{ fontSize: 13, marginTop: 4 }}>{rec.content}</div>
              {rec.reasoning && <div className="tip-reasoning">🔬 {rec.reasoning}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
