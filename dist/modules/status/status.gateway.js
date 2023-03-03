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
exports.StatusGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const plugins_service_1 = require("../plugins/plugins.service");
const status_service_1 = require("./status.service");
const ws_guard_1 = require("../../core/auth/guards/ws.guard");
const child_bridges_service_1 = require("../child-bridges/child-bridges.service");
let StatusGateway = class StatusGateway {
    constructor(statusService, pluginsService, childBridgesService) {
        this.statusService = statusService;
        this.pluginsService = pluginsService;
        this.childBridgesService = childBridgesService;
    }
    async getDashboardLayout(client, payload) {
        try {
            return await this.statusService.getDashboardLayout();
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async setDashboardLayout(client, payload) {
        try {
            return await this.statusService.setDashboardLayout(payload);
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async homebridgeVersionCheck(client, payload) {
        try {
            return await this.pluginsService.getHomebridgePackage();
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async npmVersionCheck(client, payload) {
        try {
            return await this.pluginsService.getNpmPackage();
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async nodeJsVersionCheck(client, payload) {
        try {
            return await this.statusService.getNodeJsVersionInfo();
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async getOutOfDatePlugins(client, payload) {
        try {
            return await this.pluginsService.getOutOfDatePlugins();
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async getHomebridgeServerInfo(client, payload) {
        try {
            return await this.statusService.getHomebridgeServerInfo();
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async getServerCpuInfo(client, payload) {
        try {
            return await this.statusService.getServerCpuInfo();
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async getServerMemoryInfo(client, payload) {
        try {
            return await this.statusService.getServerMemoryInfo();
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async getServerNetworkInfo(client, payload) {
        try {
            return await this.statusService.getCurrentNetworkUsage();
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async getServerUptimeInfo(client, payload) {
        try {
            return await this.statusService.getServerUptimeInfo();
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async getHomebridgePairingPin(client, payload) {
        try {
            return await this.statusService.getHomebridgePairingPin();
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async getHomebridgeStatus(client, payload) {
        try {
            return await this.statusService.getHomebridgeStatus();
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async serverStatus(client, payload) {
        this.statusService.watchStats(client);
    }
    async getChildBridges(client, payload) {
        try {
            return await this.childBridgesService.getChildBridges();
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async watchChildBridgeStatus(client, payload) {
        this.childBridgesService.watchChildBridgeStatus(client);
    }
    async getRaspberryPiThrottledStatus(client, payload) {
        try {
            return await this.statusService.getRaspberryPiThrottledStatus();
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
};
__decorate([
    (0, websockets_1.SubscribeMessage)('get-dashboard-layout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "getDashboardLayout", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('set-dashboard-layout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "setDashboardLayout", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('homebridge-version-check'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "homebridgeVersionCheck", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('npm-version-check'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "npmVersionCheck", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('nodejs-version-check'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "nodeJsVersionCheck", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-out-of-date-plugins'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "getOutOfDatePlugins", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-homebridge-server-info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "getHomebridgeServerInfo", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-server-cpu-info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "getServerCpuInfo", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-server-memory-info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "getServerMemoryInfo", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-server-network-info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "getServerNetworkInfo", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-server-uptime-info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "getServerUptimeInfo", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-homebridge-pairing-pin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "getHomebridgePairingPin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-homebridge-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "getHomebridgeStatus", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('monitor-server-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "serverStatus", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-homebridge-child-bridge-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "getChildBridges", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('monitor-child-bridge-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "watchChildBridgeStatus", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-raspberry-pi-throttled-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StatusGateway.prototype, "getRaspberryPiThrottledStatus", null);
StatusGateway = __decorate([
    (0, common_1.UseGuards)(ws_guard_1.WsGuard),
    (0, websockets_1.WebSocketGateway)({
        namespace: 'status', allowEIO3: true, cors: {
            origin: ['http://localhost:8080', 'http://localhost:4200'],
            credentials: true
        }
    }),
    __metadata("design:paramtypes", [status_service_1.StatusService,
        plugins_service_1.PluginsService,
        child_bridges_service_1.ChildBridgesService])
], StatusGateway);
exports.StatusGateway = StatusGateway;
//# sourceMappingURL=status.gateway.js.map