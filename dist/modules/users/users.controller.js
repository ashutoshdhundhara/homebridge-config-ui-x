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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("../../core/auth/auth.service");
const admin_guard_1 = require("../../core/auth/guards/admin.guard");
const users_dto_1 = require("./users.dto");
let UsersController = class UsersController {
    constructor(authService) {
        this.authService = authService;
    }
    getUsers() {
        return this.authService.getUsers(true);
    }
    addUser(body) {
        return this.authService.addUser(body);
    }
    updateUser(userId, body) {
        return this.authService.updateUser(userId, body);
    }
    deleteUser(userId) {
        return this.authService.deleteUser(userId);
    }
    updateOwnPassword(req, body) {
        return this.authService.updateOwnPassword(req.user.username, body.currentPassword, body.newPassword);
    }
    setupOtp(req) {
        return this.authService.setupOtp(req.user.username);
    }
    activateOtp(req, body) {
        return this.authService.activateOtp(req.user.username, body.code);
    }
    deactivateOtp(req, body) {
        return this.authService.deactivateOtp(req.user.username, body.password);
    }
};
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiResponse)({ type: users_dto_1.UserDto, isArray: true, status: 200 }),
    (0, swagger_1.ApiOperation)({ summary: 'List of existing users.' }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getUsers", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiResponse)({ type: users_dto_1.UserDto, status: 201 }),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user.' }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_dto_1.UserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "addUser", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiResponse)({ type: users_dto_1.UserDto, status: 200 }),
    (0, swagger_1.ApiOperation)({ summary: 'Update a user.' }),
    (0, swagger_1.ApiParam)({ name: 'userId', type: 'number' }),
    (0, common_1.Patch)('/:userId(\\d+)'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, users_dto_1.UserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a user.' }),
    (0, swagger_1.ApiParam)({ name: 'userId', type: 'number' }),
    (0, common_1.Delete)('/:userId(\\d+)'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteUser", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update the password for the current user.' }),
    (0, swagger_1.ApiBody)({ type: users_dto_1.UserUpdatePasswordDto }),
    (0, common_1.Post)('/change-password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.UserUpdatePasswordDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateOwnPassword", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Start 2FA setup for the current user.' }),
    (0, common_1.Post)('/otp/setup'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "setupOtp", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Activate 2FA setup for the current user.' }),
    (0, swagger_1.ApiBody)({ type: users_dto_1.UserActivateOtpDto }),
    (0, common_1.Post)('/otp/activate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.UserActivateOtpDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "activateOtp", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate 2FA setup for the current user.' }),
    (0, swagger_1.ApiBody)({ type: users_dto_1.UserDeactivateOtpDto }),
    (0, common_1.Post)('/otp/deactivate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.UserDeactivateOtpDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deactivateOtp", null);
UsersController = __decorate([
    (0, swagger_1.ApiTags)('User Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map