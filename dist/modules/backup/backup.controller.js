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
exports.BackupController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const backup_service_1 = require("./backup.service");
const admin_guard_1 = require("../../core/auth/guards/admin.guard");
const logger_service_1 = require("../../core/logger/logger.service");
let BackupController = class BackupController {
    constructor(backupService, logger) {
        this.backupService = backupService;
        this.logger = logger;
    }
    async downloadBackup(res) {
        try {
            return await this.backupService.downloadBackup(res);
        }
        catch (e) {
            console.error(e);
            this.logger.error('Backup Failed ' + e);
            throw new common_1.InternalServerErrorException(e.message);
        }
    }
    async getNextBackupTime() {
        return this.backupService.getNextBackupTime();
    }
    async listScheduledBackups() {
        return this.backupService.listScheduledBackups();
    }
    async getScheduledBackup(backupId) {
        return this.backupService.getScheduledBackup(backupId);
    }
    async restoreBackup(req) {
        try {
            const data = await req.file();
            await this.backupService.uploadBackupRestore(data);
        }
        catch (err) {
            this.logger.error('Restore backup failed:', err.message);
            throw new common_1.InternalServerErrorException(err.message);
        }
    }
    async restoreBackupTrigger() {
        return await this.backupService.triggerHeadlessRestore();
    }
    async restoreHbfx(req) {
        try {
            const data = await req.file();
            await this.backupService.uploadHbfxRestore(data);
        }
        catch (err) {
            this.logger.error('Restore backup failed:', err.message);
            throw new common_1.InternalServerErrorException(err.message);
        }
    }
    postBackupRestoreRestart() {
        return this.backupService.postBackupRestoreRestart();
    }
};
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Download a .tar.gz of the Homebridge instance.' }),
    (0, common_1.Get)('/download'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "downloadBackup", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Return the date and time of the next scheduled backup.' }),
    (0, common_1.Get)('/scheduled-backups/next'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getNextBackupTime", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'List available system generated instance backups.' }),
    (0, common_1.Get)('/scheduled-backups'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "listScheduledBackups", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Download a system generated instance backup.' }),
    (0, swagger_1.ApiParam)({ name: 'backupId', type: 'string' }),
    (0, common_1.Get)('/scheduled-backups/:backupId'),
    __param(0, (0, common_1.Param)('backupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "getScheduledBackup", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Post)('/restore'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload a .tar.gz of the Homebridge instance.',
        description: 'NOTE: This endpoint does not trigger the restore process.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "restoreBackup", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Put)('/restore/trigger'),
    (0, swagger_1.ApiOperation)({
        summary: 'Triggers a headless restore process from the last uploaded backup file.',
        description: 'Logs to stdout / stderr.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "restoreBackupTrigger", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload a .hbfx backup file created by third party apps.',
        description: 'NOTE: This endpoint does not trigger the restore process.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, common_1.Post)('/restore/hbfx'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BackupController.prototype, "restoreHbfx", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Put)('/restart'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger a hard restart of Homebridge (use after restoring backup).' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BackupController.prototype, "postBackupRestoreRestart", null);
BackupController = __decorate([
    (0, swagger_1.ApiTags)('Backup & Restore'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    (0, common_1.Controller)('backup'),
    __metadata("design:paramtypes", [backup_service_1.BackupService,
        logger_service_1.Logger])
], BackupController);
exports.BackupController = BackupController;
//# sourceMappingURL=backup.controller.js.map