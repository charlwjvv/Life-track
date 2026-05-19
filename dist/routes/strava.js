"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stravaRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
exports.stravaRouter = (0, express_1.Router)();
exports.stravaRouter.use(auth_1.authenticate);
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || '';
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || '';
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || 'lifetrack://strava-callback';
exports.stravaRouter.get('/auth-url', (_req, res) => {
    const url = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(STRAVA_REDIRECT_URI)}&response_type=code&approval_prompt=auto&scope=read,activity:read_all`;
    res.json({ url });
});
exports.stravaRouter.post('/token', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code)
            return res.status(400).json({ error: 'Authorization code required' });
        const params = new URLSearchParams({
            client_id: STRAVA_CLIENT_ID,
            client_secret: STRAVA_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
        });
        const response = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
        });
        const data = (await response.json());
        if (!response.ok)
            return res.status(400).json({ error: data.message || 'Failed to exchange token' });
        const { error } = await db_1.supabase
            .from('strava_tokens')
            .upsert({
            user_id: req.userId,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: new Date(data.expires_at * 1000).toISOString(),
            athlete_id: data.athlete?.id,
        }, { onConflict: 'user_id' });
        if (error)
            return res.status(500).json({ error: error.message });
        res.json({ connected: true, athlete: data.athlete });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to connect Strava' });
    }
});
async function refreshStravaToken(userId) {
    const { data: token } = await db_1.supabase
        .from('strava_tokens')
        .select('access_token, refresh_token, expires_at')
        .eq('user_id', userId)
        .single();
    if (!token)
        return null;
    if (new Date(token.expires_at) > new Date())
        return token.access_token;
    const params = new URLSearchParams({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: token.refresh_token,
    });
    const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
    });
    const data = (await response.json());
    if (!response.ok)
        return null;
    await db_1.supabase
        .from('strava_tokens')
        .update({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(data.expires_at * 1000).toISOString(),
    })
        .eq('user_id', userId);
    return data.access_token;
}
exports.stravaRouter.get('/activities', async (req, res) => {
    try {
        const accessToken = await refreshStravaToken(req.userId);
        if (!accessToken)
            return res.status(400).json({ error: 'Strava not connected' });
        const after = req.query.after || Math.floor(Date.now() / 1000 - 7 * 24 * 60 * 60);
        const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=50`, { headers: { Authorization: `Bearer ${accessToken}` } });
        const activities = (await response.json());
        if (!response.ok) {
            const err = (await response.json());
            return res.status(400).json({ error: err.message });
        }
        const runs = activities.filter((a) => a.type === 'Run');
        for (const run of runs) {
            await db_1.supabase
                .from('runs')
                .upsert({
                user_id: req.userId,
                strava_id: run.id,
                name: run.name,
                distance: run.distance,
                moving_time: run.moving_time,
                elapsed_time: run.elapsed_time,
                total_elevation: run.total_elevation_gain,
                start_date: run.start_date,
                average_speed: run.average_speed,
                max_speed: run.max_speed,
                average_heartrate: run.average_heartrate,
                max_heartrate: run.max_heartrate,
                map_polyline: run.map?.summary_polyline,
                map_summary: run.map?.summary_polyline,
            }, { onConflict: 'strava_id' });
        }
        res.json({ runs: runs.length, activities });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});
exports.stravaRouter.get('/weekly', async (req, res) => {
    try {
        const now = new Date();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        const { data: runs } = await db_1.supabase
            .from('runs')
            .select('*')
            .eq('user_id', req.userId)
            .gte('start_date', startOfWeek.toISOString())
            .lt('start_date', endOfWeek.toISOString())
            .order('start_date', { ascending: false });
        const runList = runs || [];
        const totalDistance = runList.reduce((sum, r) => sum + r.distance, 0);
        const totalTime = runList.reduce((sum, r) => sum + r.moving_time, 0);
        res.json({
            runs: runList,
            totalDistance,
            totalDistanceKm: (totalDistance / 1000).toFixed(2),
            totalTimeMinutes: Math.round(totalTime / 60),
            runCount: runList.length,
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.stravaRouter.get('/routes', async (req, res) => {
    try {
        const { data, error } = await db_1.supabase
            .from('runs')
            .select('id, name, distance, moving_time, start_date, map_summary, average_speed')
            .eq('user_id', req.userId)
            .not('map_summary', 'is', null)
            .order('start_date', { ascending: false })
            .limit(20);
        if (error)
            return res.status(500).json({ error: error.message });
        res.json(data || []);
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.stravaRouter.get('/status', async (req, res) => {
    try {
        const { data: token } = await db_1.supabase
            .from('strava_tokens')
            .select('athlete_id')
            .eq('user_id', req.userId)
            .single();
        const { count } = await db_1.supabase
            .from('runs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', req.userId);
        res.json({ connected: !!token, athleteId: token?.athlete_id || null, totalRuns: count || 0 });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
//# sourceMappingURL=strava.js.map