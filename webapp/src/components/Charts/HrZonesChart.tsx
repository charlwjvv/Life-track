import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function HrZonesChart({ data }: { data: { zone: string; minutes: number; percentage: number }[] }) {
  if (!data || data.length === 0 || data.every(d => d.minutes === 0)) {
    return (
      <div className="chart-container">
        <div className="chart-title">❤️ Heart Rate Zones</div>
        <div className="empty-state" style={{ padding: 30 }}>
          <p>Run with heart rate data to see your zone distribution</p>
        </div>
      </div>
    );
  }

  const colors = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444'];

  const chartData = {
    labels: data.map(d => `${d.zone} (${d.percentage}%)`),
    datasets: [{
      data: data.map(d => d.minutes),
      backgroundColor: colors,
      borderColor: '#12121a',
      borderWidth: 2,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#9090a0', padding: 12, font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: '#1a1a26',
        titleColor: '#f0f0f5',
        bodyColor: '#9090a0',
        borderColor: '#2a2a3a',
        borderWidth: 1,
        callbacks: {
          label: (ctx: any) => `${ctx.raw} min (${data[ctx.dataIndex]?.percentage}%)`,
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <div className="chart-title">❤️ Heart Rate Zone Distribution</div>
      <div style={{ height: 220, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 220 }}>
          <Doughnut data={chartData} options={options} />
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
        Zone 1: Recovery · Zone 2: Aerobic · Zone 3: Tempo · Zone 4: Threshold · Zone 5: Max
      </div>
    </div>
  );
}
