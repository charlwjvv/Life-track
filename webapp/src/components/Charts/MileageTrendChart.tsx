import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function MileageTrendChart({ data }: { data: { week: string; km: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-title">📈 Weekly Mileage Trend</div>
        <div className="empty-state" style={{ padding: 30 }}>
          <p>Log some runs to see your mileage trend</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.week),
    datasets: [{
      label: 'Weekly km',
      data: data.map(d => d.km),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#6366f1',
      borderWidth: 2,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { tooltip: { backgroundColor: '#1a1a26', titleColor: '#f0f0f5', bodyColor: '#9090a0', borderColor: '#2a2a3a', borderWidth: 1 } },
    scales: {
      x: { grid: { color: 'rgba(42,42,58,0.5)' }, ticks: { color: '#606070', maxTicksLimit: 8, font: { size: 11 } } },
      y: { grid: { color: 'rgba(42,42,58,0.5)' }, ticks: { color: '#606070', font: { size: 11 } }, beginAtZero: true },
    },
  };

  const trend = data.length >= 2 ? data[data.length - 1].km - data[0].km : 0;

  return (
    <div className="chart-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="chart-title" style={{ margin: 0 }}>📈 Weekly Mileage Trend</div>
        <div style={{ fontSize: 13, color: trend >= 0 ? 'var(--green)' : 'var(--red)' }}>
          {trend >= 0 ? '+' : ''}{trend.toFixed(1)}km over 12 weeks
        </div>
      </div>
      <div style={{ height: 220 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
