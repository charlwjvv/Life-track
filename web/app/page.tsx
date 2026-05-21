'use client';

import { useState } from 'react';
import { GLSLHills } from '@/components/ui/glsl-hills';
import { Wallet, Flame, Bike, Target, ChevronRight, X } from 'lucide-react';

const features = [
  { id: 'budget', label: 'Budget', icon: Wallet, desc: 'Track spending & savings' },
  { id: 'calories', label: 'Calories', icon: Flame, desc: 'Daily intake & macros' },
  { id: 'strava', label: 'Strava', icon: Bike, desc: 'Run & ride analytics' },
  { id: 'coach', label: 'Coach', icon: Target, desc: 'AI training guidance' },
];

export default function Home() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <GLSLHills />
      </div>

      {/* Overlay gradient for readability */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/60 via-black/40 to-black/90" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Title */}
        <div className="text-center mb-16 pointer-events-none">
          <h1 className="font-thin italic text-5xl md:text-6xl mb-3 tracking-tight">
            LifeTrack
          </h1>
          <p className="text-sm text-white/50 tracking-wide uppercase">
            Budget · Calories · Running · Coaching
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full">
          {features.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className="group flex flex-col items-center gap-3 p-6 border border-white/10 rounded-xl bg-black/40 backdrop-blur-sm hover:border-white/30 hover:bg-white/5 transition-all duration-300"
            >
              <f.icon className="w-8 h-8 text-white/70 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium tracking-wide">{f.label}</span>
              <span className="text-xs text-white/40">{f.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="relative w-full max-w-2xl bg-black border border-white/10 rounded-2xl p-8">
            <button
              onClick={() => setActive(null)}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <FeatureContent id={active} />
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureContent({ id }: { id: string }) {
  const config: Record<string, { title: string; items: string[] }> = {
    budget: {
      title: 'Budget',
      items: ['Monthly spending overview', 'Category breakdown', 'Savings goals', 'Transaction history'],
    },
    calories: {
      title: 'Calories',
      items: ['Daily calorie target', 'Macro tracking (protein/carbs/fat)', 'Meal logging', 'Weekly trends'],
    },
    strava: {
      title: 'Strava',
      items: ['Activity sync', 'Distance & pace stats', 'Weekly mileage', 'Personal records'],
    },
    coach: {
      title: 'Coach',
      items: ['AI training plans', 'Recovery recommendations', 'Race prep guidance', 'Form tips'],
    },
  };

  const { title, items } = config[id] || { title: id, items: [] };

  return (
    <div>
      <h2 className="text-2xl font-thin italic mb-6">{title}</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-white/70">
            <ChevronRight className="w-4 h-4 text-white/40" />
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-white/30">
        Connect to backend at your Railway URL to enable live data.
      </p>
    </div>
  );
}
