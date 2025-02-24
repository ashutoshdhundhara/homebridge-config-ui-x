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
exports.DockerController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const admin_guard_1 = require("../../../core/auth/guards/admin.guard");
const docker_service_1 = require("./docker.service");
let DockerController = class DockerController {
    constructor(dockerService) {
        this.dockerService = dockerService;
    }
    getStartupScript() {
        return this.dockerService.getStartupScript();
    }
    updateStartupScript(body) {
        return this.dockerService.updateStartupScript(body.script);
    }
    restartDockerContainer() {
        return this.dockerService.restartDockerContainer();
    }
};
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Return the oznu/homebridge docker image startup.sh file contents.' }),
    (0, common_1.Get)('startup-script'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DockerController.prototype, "getStartupScript", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update the oznu/homebridge docker image startup.sh file contents.' }),
    (0, common_1.Put)('startup-script'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DockerController.prototype, "updateStartupScript", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Restart the oznu/homebridge docker image container.' }),
    (0, common_1.Put)('restart-container'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DockerController.prototype, "restartDockerContainer", null);
DockerController = __decorate([
    (0, swagger_1.ApiTags)('Platform - Docker'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    (0, common_1.Controller)('platform-tools/docker'),
    __metadata("design:paramtypes", [docker_service_1.DockerService])
], DockerController);
exports.DockerController = DockerController;
//# sourceMappingURL=docker.controller.js.map