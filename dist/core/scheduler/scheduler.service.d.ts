import * as schedule from 'node-schedule';
export declare class SchedulerService {
    readonly scheduleJob: typeof schedule.scheduleJob;
    readonly scheduledJobs: {
        [jobName: string]: schedule.Job;
    };
    readonly cancelJob: typeof schedule.cancelJob;
    readonly RecurrenceRule: typeof schedule.RecurrenceRule;
}
