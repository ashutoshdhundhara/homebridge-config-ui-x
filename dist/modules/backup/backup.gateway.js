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
exports.BackupGateway = void 0;
const color = require("bash-color");
const events_1 = require("events");
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const logger_service_1 = require("../../core/logger/logger.service");
const ws_admin_guard_1 = require("../../core/auth/guards/ws-admin-guard");
const backup_service_1 = require("./backup.service");
let BackupGateway = class BackupGateway {
    constructor(backupService, logger) {
        this.backupService = backupService;
        this.logger = logger;
    }
    async doRestore(client) {
        try {
            return await this.backupService.restoreFromBackup(client);
        }
        catch (e) {
            this.logger.error(e);
            client.emit('stdout', '\n\r' + color.red(e.toString()) + '\n\r');
            return new websockets_1.WsException(e);
        }
    }
    async doRestoreHbfx(client) {
        try {
            return await this.backupService.restoreHbfxBackup(client);
        }
        catch (e) {
            this.logger.error(e);
            client.emit('stdout', '\n\r' + color.red(e.toString()) + '\n\r');
            return new websockets_1.WsException(e);
        }
    }
};
__decorate([
    (0, websockets_1.SubscribeMessage)('do-restore'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [events_1.EventEmitter]),
    __metadata("design:returntype", Promise)
], BackupGateway.prototype, "doRestore", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('do-restore-hbfx'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [events_1.EventEmitter]),
    __metadata("design:returntype", Promise)
], BackupGateway.prototype, "doRestoreHbfx", null);
BackupGateway = __decorate([
    (0, common_1.UseGuards)(ws_admin_guard_1.WsAdminGuard),
    (0, websockets_1.WebSocketGateway)({
        namespace: '/backup', allowEIO3: true, cors: {
            origin: ['http://localhost:8080', 'http://localhost:4200'],
            credentials: true
        }
    }),
    __metadata("design:paramtypes", [backup_service_1.BackupService,
        logger_service_1.Logger])
], BackupGateway);
exports.BackupGateway = BackupGateway;
//# sourceMappingURL=backup.gateway.js.map