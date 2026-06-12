import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function WorkoutBreakdown({ data }: { data: { type: string; count: number; totalKm: number; totalMin: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-title">🏃 Workout Type Breakdown</div>
        <div className="empty-state" style={{ padding: 30 }}>
          <p>Log different run types to see your workout breakdown</p>
        </div>
      </div>
    );
  }

  const colors = ['#6366f1', '#22c55e', '#eab308', '#f97316', '#ef4444', '#a855f7', '#3b82f6'];

  const chartData = {
    labels: data.map(d => d.type),
    datasets: [
      {
        label: 'Distance (km)',
        data: data.map(d => d.totalKm),
        backgroundColor: colors,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1a1a26', titleColor: '#f0f0f5', bodyColor: '#9090a0', borderColor: '#2a2a3a', borderWidth: 1 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#606070', font: { size: 11 } } },
      y: { grid: { color: 'rgba(42,42,58,0.5)' }, ticks: { color: '#606070', font: { size: 11 } }, beginAtZero: true },
    },
  };

  return (
    <div className="chart-container">
      <div className="chart-title">🏃 Workout Type Breakdown</div>
      <div style={{ height: 200 }}>
        <Bar data={chartData} options={options} />
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {data.map((d, i) => (
          <div key={i} style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            <span style={{ color: colors[i % colors.length] }}>●</span> {d.type}: {d.count} runs
          </div>
        ))}
      </div>
    </div>
  );
}
