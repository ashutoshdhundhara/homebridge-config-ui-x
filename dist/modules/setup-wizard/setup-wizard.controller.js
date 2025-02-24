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
exports.SetupWizardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_dto_1 = require("../users/users.dto");
const auth_service_1 = require("../../core/auth/auth.service");
const setup_wizard_guard_1 = require("./setup-wizard.guard");
let SetupWizardController = class SetupWizardController {
    constructor(authService) {
        this.authService = authService;
    }
    async setupFirstUser(body) {
        return await this.authService.setupFirstUser(body);
    }
    async generateSetupWizardToken() {
        return await this.authService.generateSetupWizardToken();
    }
};
__decorate([
    (0, common_1.Post)('/create-first-user'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create the first user.',
        description: 'This endpoint is not available after the Homebridge setup wizard is complete.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_dto_1.UserDto]),
    __metadata("design:returntype", Promise)
], SetupWizardController.prototype, "setupFirstUser", null);
__decorate([
    (0, common_1.Get)('/get-setup-wizard-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Creates a auth token to be used by the setup wizard.',
        description: 'This endpoint is not available after the Homebridge setup wizard is complete.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SetupWizardController.prototype, "generateSetupWizardToken", null);
SetupWizardController = __decorate([
    (0, swagger_1.ApiTags)('Setup Wizard'),
    (0, common_1.UseGuards)(setup_wizard_guard_1.SetupWizardGuard),
    (0, common_1.Controller)('setup-wizard'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], SetupWizardController);
exports.SetupWizardController = SetupWizardController;
//# sourceMappingURL=setup-wizard.controller.js.map