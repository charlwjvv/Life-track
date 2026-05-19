"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map