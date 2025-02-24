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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HbServiceController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const admin_guard_1 = require("../../../core/auth/guards/admin.guard");
const hb_service_service_1 = require("./hb-service.service");
const hb_service_dto_1 = require("./hb-service.dto");
let HbServiceController = class HbServiceController {
    constructor(hbServiceService) {
        this.hbServiceService = hbServiceService;
    }
    getHomebridgeStartupSettings() {
        return this.hbServiceService.getHomebridgeStartupSettings();
    }
    setHomebridgeStartupSettings(body) {
        return this.hbServiceService.setHomebridgeStartupSettings(body);
    }
    setFullServiceRestartFlag() {
        return this.hbServiceService.setFullServiceRestartFlag();
    }
    downloadLogFile(colour) {
        return this.hbServiceService.downloadLogFile((colour === 'yes'));
    }
    truncateLogFile(req) {
        return this.hbServiceService.truncateLogFile(req.user.username);
    }
};
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Return the startup flags and env variables for Homebridge.' }),
    (0, common_1.Get)('homebridge-startup-settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HbServiceController.prototype, "getHomebridgeStartupSettings", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update the startup flags and env variables for Homebridge.' }),
    (0, common_1.Put)('homebridge-startup-settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [hb_service_dto_1.HbServiceStartupSettings]),
    __metadata("design:returntype", void 0)
], HbServiceController.prototype, "setHomebridgeStartupSettings", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Request the UI does a full restart next time a restart for Homebridge is sent.',
        description: 'When running under hb-service the UI will only restart if it detects it needs to.',
    }),
    (0, common_1.Put)('set-full-service-restart-flag'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HbServiceController.prototype, "setFullServiceRestartFlag", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Download the entire log file.' }),
    (0, common_1.Get)('log/download'),
    (0, swagger_1.ApiQuery)({ name: 'colour', enum: ['yes', 'no'], required: false }),
    __param(0, (0, common_1.Query)('colour')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HbServiceController.prototype, "downloadLogFile", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Truncate / empty the log file.' }),
    (0, common_1.Put)('log/truncate'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HbServiceController.prototype, "truncateLogFile", null);
HbServiceController = __decorate([
    (0, swagger_1.ApiTags)('Platform - HB Service'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    (0, common_1.Controller)('platform-tools/hb-service'),
    __metadata("design:paramtypes", [hb_service_service_1.HbServiceService])
], HbServiceController);
exports.HbServiceController = HbServiceController;
//# sourceMappingURL=hb-service.controller.js.map