"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("./routes/auth");
const budget_1 = require("./routes/budget");
const goals_1 = require("./routes/goals");
const calories_1 = require("./routes/calories");
const strava_1 = require("./routes/strava");
const coach_1 = require("./routes/coach");
const council_1 = require("./routes/council");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API routes
app.use('/api/auth', auth_1.authRouter);
app.use('/api/budget', budget_1.budgetRouter);
app.use('/api/goals', goals_1.goalsRouter);
app.use('/api/calories', calories_1.caloriesRouter);
app.use('/api/strava', strava_1.stravaRouter);
app.use('/api/coach', coach_1.coachRouter);
app.use('/api/council', council_1.councilRouter);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
// Serve the webapp frontend (only in local dev, Vercel handles frontend separately)
const webappDist = path_1.default.join(__dirname, '../../webapp/dist');
app.use(express_1.default.static(webappDist));
// SPA fallback: serve index.html for all non-API routes
app.get('*', (_req, res) => {
    res.sendFile(path_1.default.join(webappDist, 'index.html'));
});
// Only listen when run directly (not in Vercel serverless)
if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Webapp: http://localhost:${PORT}`);
        console.log(`API: http://localhost:${PORT}/api/health`);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map