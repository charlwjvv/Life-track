import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function PaceDistribution({ data }: { data: { pace: string; count: number; avgHr: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-title">⏱ Pace Distribution</div>
        <div className="empty-state" style={{ padding: 30 }}>
          <p>Log runs with speed data to see your pace distribution</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.pace),
    datasets: [{
      label: 'Runs',
      data: data.map(d => d.count),
      backgroundColor: '#6366f1',
      borderRadius: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { backgroundColor: '#1a1a26', titleColor: '#f0f0f5', bodyColor: '#9090a0', borderColor: '#2a2a3a', borderWidth: 1 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#606070', font: { size: 10 }, maxRotation: 45 } },
      y: { grid: { color: 'rgba(42,42,58,0.5)' }, ticks: { color: '#606070', font: { size: 11 } }, beginAtZero: true, maxTicksLimit: 6 },
    },
  };

  return (
    <div className="chart-container">
      <div className="chart-title">⏱ Pace Distribution</div>
      <div style={{ height: 200 }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
