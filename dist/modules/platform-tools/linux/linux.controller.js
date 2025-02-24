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
exports.LinuxController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const linux_service_1 = require("./linux.service");
const admin_guard_1 = require("../../../core/auth/guards/admin.guard");
let LinuxController = class LinuxController {
    constructor(linuxServer) {
        this.linuxServer = linuxServer;
    }
    restartHost() {
        return this.linuxServer.restartHost();
    }
    shutdownHost() {
        return this.linuxServer.shutdownHost();
    }
};
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Restart / reboot the host server.' }),
    (0, common_1.Put)('restart-host'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LinuxController.prototype, "restartHost", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Shutdown / power off the host server.' }),
    (0, common_1.Put)('shutdown-host'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LinuxController.prototype, "shutdownHost", null);
LinuxController = __decorate([
    (0, swagger_1.ApiTags)('Platform - Linux'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    (0, common_1.Controller)('platform-tools/linux'),
    __metadata("design:paramtypes", [linux_service_1.LinuxService])
], LinuxController);
exports.LinuxController = LinuxController;
//# sourceMappingURL=linux.controller.js.map