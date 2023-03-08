"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule = require("node-schedule");
let SchedulerService = class SchedulerService {
    constructor() {
        this.scheduleJob = schedule.scheduleJob;
        this.scheduledJobs = schedule.scheduledJobs;
        this.cancelJob = schedule.cancelJob;
        this.RecurrenceRule = schedule.RecurrenceRule;
    }
};
SchedulerService = __decorate([
    (0, common_1.Injectable)()
], SchedulerService);
exports.SchedulerService = SchedulerService;
//# sourceMappingURL=scheduler.service.js.map