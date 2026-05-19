"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coachRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
exports.coachRouter = (0, express_1.Router)();
exports.coachRouter.use(auth_1.authenticate);
exports.coachRouter.get('/advice', async (req, res) => {
    try {
        const { data, error } = await db_1.supabase
            .from('coach_advice')
            .select('*')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false })
            .limit(20);
        if (error)
            return res.status(500).json({ error: error.message });
        res.json(data || []);
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.coachRouter.post('/generate', async (req, res) => {
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
            .order('start_date', { ascending: true });
        const runList = runs || [];
        const totalDistance = runList.reduce((sum, r) => sum + r.distance, 0) / 1000;
        const totalTime = runList.reduce((sum, r) => sum + r.moving_time, 0) / 60;
        const avgSpeed = runList.length > 0 ? runList.reduce((sum, r) => sum + (r.average_speed || 0), 0) / runList.length : 0;
        const avgHr = runList.length > 0 ? runList.reduce((sum, r) => sum + (r.average_heartrate || 0), 0) / runList.length : 0;
        const runCount = runList.length;
        const advice = [];
        if (runCount === 0) {
            advice.push('Start with 3 runs per week — even 15-20 minutes builds the habit');
            advice.push('Aim for 10-15km total in your first week');
            advice.push('Focus on consistency over speed');
        }
        else {
            const avgPace = avgSpeed > 0 ? 60 / (avgSpeed * 3.6) : 0;
            if (totalDistance < 15)
                advice.push(`You ran ${totalDistance.toFixed(1)}km this week. Try increasing to 15-20km next week`);
            else if (totalDistance < 30)
                advice.push(`Good week with ${totalDistance.toFixed(1)}km! Consider adding one long run`);
            else
                advice.push(`Great mileage at ${totalDistance.toFixed(1)}km — make sure to include rest days`);
            if (runCount < 3)
                advice.push(`Only ${runCount} runs this week. 3-4 runs per week is ideal for progression`);
            if (avgPace > 6 && avgPace < 7)
                advice.push('Your pace is in a good range. Try interval training to improve speed');
            else if (avgPace >= 7)
                advice.push('Work on form and try walk-run intervals to build speed gradually');
            else if (avgPace > 0 && avgPace <= 5)
                advice.push('Your pace is strong! Focus on endurance with longer runs');
            if (avgHr > 0) {
                if (avgHr > 160)
                    advice.push('Your average HR is high — slow down your easy runs to build aerobic base');
                else if (avgHr < 140)
                    advice.push('Good heart rate zone for endurance building');
            }
            advice.push(getTrainingTip(runCount, totalDistance));
        }
        const saved = [];
        for (const content of advice) {
            const { data: a } = await db_1.supabase
                .from('coach_advice')
                .insert({ user_id: req.userId, type: 'weekly', content })
                .select()
                .single();
            if (a)
                saved.push(a);
        }
        res.json({ advice: saved });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.coachRouter.get('/plan', async (req, res) => {
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
            .order('start_date', { ascending: true });
        const runList = runs || [];
        const totalDistance = runList.reduce((sum, r) => sum + r.distance, 0) / 1000;
        const weeklyGoal = 20;
        const progress = Math.min(100, (totalDistance / weeklyGoal) * 100);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const plan = days.map((day, i) => {
            const d = new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000);
            const runThatDay = runList.find((r) => {
                const rd = new Date(r.start_date);
                return rd.getDate() === d.getDate() && rd.getMonth() === d.getMonth();
            });
            return {
                day,
                date: d.toISOString().split('T')[0],
                type: runThatDay ? 'Run' : getRecommendedWorkout(i, runList.length, totalDistance),
                distance: runThatDay ? (runThatDay.distance / 1000).toFixed(2) : null,
                completed: !!runThatDay,
            };
        });
        res.json({ plan, weeklyGoal, progressKm: totalDistance.toFixed(1), progress });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
function getRecommendedWorkout(dayIndex, runCount, totalKm) {
    if (runCount === 0) {
        const restDays = [2, 5, 6];
        if (restDays.includes(dayIndex))
            return 'Rest';
        return 'Easy run 3-5km';
    }
    const longRunDay = 6;
    const speedDay = 2;
    const easyDays = [0, 3];
    if (dayIndex === longRunDay)
        return 'Long run 8-12km';
    if (dayIndex === speedDay)
        return 'Intervals: 6x400m';
    if (easyDays.includes(dayIndex))
        return 'Easy run 5-7km';
    return 'Rest or cross-train';
}
function getTrainingTip(runCount, totalKm) {
    if (runCount >= 4 && totalKm >= 30)
        return 'You are in great shape — consider a 10K race as a goal';
    if (runCount >= 3 && totalKm >= 20)
        return 'Strong week! Try incorporating strides at the end of runs';
    if (runCount >= 2)
        return 'Good foundation. Add one more short run to your week';
    return 'Consistency is key — aim for 3 runs per week';
}
//# sourceMappingURL=coach.js.map