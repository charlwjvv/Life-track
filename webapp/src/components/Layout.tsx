import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { setToken } from '../api';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/plan', label: 'Training Plan', icon: '📅' },
  { path: '/runs', label: 'Log Run', icon: '🏃' },
  { path: '/advice', label: 'Coach Analysis', icon: '💡' },
  { path: '/nutrition', label: 'Nutrition', icon: '🥗' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>🏃 Coach</h1>
          <div className="tagline">Scientific running & nutrition</div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item">
            <span className="icon">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
