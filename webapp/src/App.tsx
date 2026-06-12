import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { isAuthenticated, setToken, api } from './api';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WeeklyPlan from './components/WeeklyPlan';
import CoachAdvice from './components/CoachAdvice';
import RunLogger from './components/RunLogger';
import NutritionCoach from './components/NutritionCoach';
import Analytics from './components/Analytics';
import Profile from './components/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify token is still valid on mount
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          await api.getProfile();
        } catch {
          setToken(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="auth-page">
        <div className="loading"><div className="spinner" /> Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated() ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="plan" element={<WeeklyPlan />} />
        <Route path="advice" element={<CoachAdvice />} />
        <Route path="runs" element={<RunLogger />} />
        <Route path="nutrition" element={<NutritionCoach />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
