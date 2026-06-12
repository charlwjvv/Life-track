import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function CoachAdvice() {
  const [advice, setAdvice] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAdvice();
  }, []);

  const loadAdvice = async () => {
    try {
      setLoading(true);
      const res = await api.getAdvice();
      setAdvice(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const res = await api.analyzeWeek();
      await loadAdvice();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const categoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      training: 'tag-blue',
      recovery: 'tag-green',
      form: 'tag-purple',
      motivation: 'tag-yellow',
      strategy: 'tag-default',
      weekly_review: 'tag-default',
      pre_run: 'tag-yellow',
      post_run: 'tag-green',
      hydration: 'tag-blue',
    };
    return colors[cat] || 'tag-default';
  };

  if (loading) return <div className="loading"><div className="spinner" /> Loading coach advice...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h2>Coach Analysis</h2>
          <p>Personalized training and nutrition insights</p>
        </div>
        <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? 'Analyzing...' : '🔬 Analyze My Week'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {advice.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💡</div>
          <h3>No advice yet</h3>
          <p>Click "Analyze My Week" to get personalized coaching based on your training data.</p>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? 'Analyzing...' : 'Analyze My Week'}
          </button>
        </div>
      ) : (
        <div>
          <h3 className="section-title">Latest Insights</h3>
          {advice.map((item: any) => {
            // Split content and reasoning (they're stored combined with 🔬 separator)
            const parts = item.content.split('🔬');
            const content = parts[0].trim();
            const reasoning = parts[1]?.trim();

            return (
              <div key={item.id} className="tip-card">
                <div className="tip-header">
                  <span className={`tag ${categoryColor(item.type)}`}>
                    {item.type.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="tip-content">{content}</div>
                {reasoning && (
                  <div className="tip-reasoning">
                    🔬 <strong>Science:</strong> {reasoning}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
