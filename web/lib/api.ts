const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

async function request(path: string, token?: string) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  budget: (token: string) => request('/api/budget', token),
  calories: (token: string) => request('/api/calories', token),
  strava: (token: string) => request('/api/strava', token),
  coach: (token: string) => request('/api/coach', token),
  login: (email: string, password: string) =>
    fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json()),
};
