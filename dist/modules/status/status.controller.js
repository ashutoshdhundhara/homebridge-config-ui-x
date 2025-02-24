"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const status_service_1 = require("./status.service");
const child_bridges_service_1 = require("../child-bridges/child-bridges.service");
let StatusController = class StatusController {
    constructor(statusService, childBridgesService) {
        this.statusService = statusService;
        this.childBridgesService = childBridgesService;
    }
    getServerCpuInfo() {
        return this.statusService.getServerCpuInfo();
    }
    getServerMemoryInfo() {
        return this.statusService.getServerMemoryInfo();
    }
    getServerNetworkInfo() {
        return this.statusService.getCurrentNetworkUsage();
    }
    getServerUptimeInfo() {
        return this.statusService.getServerUptimeInfo();
    }
    async checkHomebridgeStatus() {
        return {
            status: await this.statusService.checkHomebridgeStatus(),
        };
    }
    async getChildBridges() {
        return this.childBridgesService.getChildBridges();
    }
    async getHomebridgeVersion() {
        return this.statusService.getHomebridgeVersion();
    }
    async getHomebridgeServerInfo() {
        return this.statusService.getHomebridgeServerInfo();
    }
    async getNodeJsVersionInfo() {
        return this.statusService.getNodeJsVersionInfo();
    }
    async getRaspberryPiThrottledStatus() {
        return this.statusService.getRaspberryPiThrottledStatus();
    }
};
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Return the current CPU load, load history and temperature (if available).' }),
    (0, common_1.Get)('/cpu'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatusController.prototype, "getServerCpuInfo", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Return total memory, memory usage, and memory usage history in bytes.' }),
    (0, common_1.Get)('/ram'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatusController.prototype, "getServerMemoryInfo", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Returns the current transmitted & received bytes per second.' }),
    (0, common_1.Get)('/network'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatusController.prototype, "getServerNetworkInfo", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Return the host and process (UI) uptime.' }),
    (0, common_1.Get)('/uptime'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatusController.prototype, "getServerUptimeInfo", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Return the current Homebridge status.',
        description: 'Possible Homebridge statuses are `up`, `pending` or `down`.'
    }),
    (0, common_1.Get)('/homebridge'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatusController.prototype, "checkHomebridgeStatus", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Return an array of the active child bridges and their status.',
        description: 'This method is only available when running `hb-service`.'
    }),
    (0, common_1.Get)('/homebridge/child-bridges'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatusController.prototype, "getChildBridges", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Return the current Homebridge version / package information.' }),
    (0, common_1.Get)('/homebridge-version'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatusController.prototype, "getHomebridgeVersion", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Return general information about the host environment.' }),
    (0, common_1.Get)('/server-information'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatusController.prototype, "getHomebridgeServerInfo", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Return current Node.js version and update availability information.' }),
    (0, common_1.Get)('/nodejs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatusController.prototype, "getNodeJsVersionInfo", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Returns throttled status for Raspberry Pi' }),
    (0, common_1.Get)('/rpi/throttled'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatusController.prototype, "getRaspberryPiThrottledStatus", null);
StatusController = __decorate([
    (0, swagger_1.ApiTags)('Server Status'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    (0, common_1.Controller)('status'),
    __metadata("design:paramtypes", [status_service_1.StatusService,
        child_bridges_service_1.ChildBridgesService])
], StatusController);
exports.StatusController = StatusController;
//# sourceMappingURL=status.controller.js.map