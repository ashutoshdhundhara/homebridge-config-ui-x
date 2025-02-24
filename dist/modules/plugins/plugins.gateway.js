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
exports.PluginsGateway = void 0;
const events_1 = require("events");
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const color = require("bash-color");
const plugins_service_1 = require("./plugins.service");
const plugins_dto_1 = require("./plugins.dto");
const logger_service_1 = require("../../core/logger/logger.service");
const ws_admin_guard_1 = require("../../core/auth/guards/ws-admin-guard");
let PluginsGateway = class PluginsGateway {
    constructor(pluginsService, logger) {
        this.pluginsService = pluginsService;
        this.logger = logger;
    }
    async installPlugin(client, pluginAction) {
        try {
            return await this.pluginsService.managePlugin('install', pluginAction, client);
        }
        catch (e) {
            this.logger.error(e);
            client.emit('stdout', '\n\r' + color.red(e.toString()) + '\n\r');
            return new websockets_1.WsException(e);
        }
    }
    async uninstallPlugin(client, pluginAction) {
        try {
            return await this.pluginsService.managePlugin('uninstall', pluginAction, client);
        }
        catch (e) {
            this.logger.error(e);
            client.emit('stdout', '\n\r' + color.red(e.toString()) + '\n\r');
            return new websockets_1.WsException(e);
        }
    }
    async updatePlugin(client, pluginAction) {
        try {
            return await this.pluginsService.managePlugin('install', pluginAction, client);
        }
        catch (e) {
            this.logger.error(e);
            client.emit('stdout', '\n\r' + color.red(e.toString()) + '\n\r');
            return new websockets_1.WsException(e);
        }
    }
    async homebridgeUpdate(client, homebridgeUpdateAction) {
        try {
            return await this.pluginsService.updateHomebridgePackage(homebridgeUpdateAction, client);
        }
        catch (e) {
            this.logger.error(e);
            client.emit('stdout', '\n\r' + color.red(e.toString()) + '\n\r');
            return new websockets_1.WsException(e);
        }
    }
};
__decorate([
    (0, websockets_1.SubscribeMessage)('install'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [events_1.EventEmitter, plugins_dto_1.PluginActionDto]),
    __metadata("design:returntype", Promise)
], PluginsGateway.prototype, "installPlugin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('uninstall'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [events_1.EventEmitter, plugins_dto_1.PluginActionDto]),
    __metadata("design:returntype", Promise)
], PluginsGateway.prototype, "uninstallPlugin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [events_1.EventEmitter, plugins_dto_1.PluginActionDto]),
    __metadata("design:returntype", Promise)
], PluginsGateway.prototype, "updatePlugin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('homebridge-update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [events_1.EventEmitter, plugins_dto_1.HomebridgeUpdateActionDto]),
    __metadata("design:returntype", Promise)
], PluginsGateway.prototype, "homebridgeUpdate", null);
PluginsGateway = __decorate([
    (0, common_1.UseGuards)(ws_admin_guard_1.WsAdminGuard),
    (0, websockets_1.WebSocketGateway)({
        namespace: '/plugins', allowEIO3: true, cors: {
            origin: ['http://localhost:8080', 'http://localhost:4200'],
            credentials: true
        }
    }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        whitelist: true,
        exceptionFactory: ((err) => {
            console.error(err);
            return new websockets_1.WsException(err);
        }),
    })),
    __metadata("design:paramtypes", [plugins_service_1.PluginsService,
        logger_service_1.Logger])
], PluginsGateway);
exports.PluginsGateway = PluginsGateway;
//# sourceMappingURL=plugins.gateway.js.map