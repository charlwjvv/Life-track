import { CoachProfile, RunRecord } from '../services/runningCoach';
export declare const coachRouter: import("express-serve-static-core").Router;
declare function getCoachProfile(userId: string): Promise<CoachProfile>;
declare function getRunsForPeriod(userId: string, startDate: Date, endDate: Date): Promise<RunRecord[]>;
declare function getAllRuns(userId: string): Promise<RunRecord[]>;
declare function getWeekBounds(offset?: number): {
    start: Date;
    end: Date;
};
export { getCoachProfile, getRunsForPeriod, getAllRuns, getWeekBounds };
//# sourceMappingURL=coach.d.ts.map