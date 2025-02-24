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
exports.ChildBridgesGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const ws_guard_1 = require("../../core/auth/guards/ws.guard");
const child_bridges_service_1 = require("./child-bridges.service");
let ChildBridgesGateway = class ChildBridgesGateway {
    constructor(childBridgesService) {
        this.childBridgesService = childBridgesService;
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
    async restartChildBridge(client, payload) {
        try {
            return await this.childBridgesService.restartChildBridge(payload);
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async stopChildBridge(client, payload) {
        try {
            return await this.childBridgesService.stopChildBridge(payload);
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
    async startChildBridge(client, payload) {
        try {
            return await this.childBridgesService.startChildBridge(payload);
        }
        catch (e) {
            return new websockets_1.WsException(e.message);
        }
    }
};
__decorate([
    (0, websockets_1.SubscribeMessage)('get-homebridge-child-bridge-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChildBridgesGateway.prototype, "getChildBridges", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('monitor-child-bridge-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChildBridgesGateway.prototype, "watchChildBridgeStatus", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('restart-child-bridge'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChildBridgesGateway.prototype, "restartChildBridge", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('stop-child-bridge'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChildBridgesGateway.prototype, "stopChildBridge", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('start-child-bridge'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChildBridgesGateway.prototype, "startChildBridge", null);
ChildBridgesGateway = __decorate([
    (0, common_1.UseGuards)(ws_guard_1.WsGuard),
    (0, websockets_1.WebSocketGateway)({
        namespace: '/child-bridges', allowEIO3: true, cors: {
            origin: ['http://localhost:8080', 'http://localhost:4200'],
            credentials: true
        }
    }),
    __metadata("design:paramtypes", [child_bridges_service_1.ChildBridgesService])
], ChildBridgesGateway);
exports.ChildBridgesGateway = ChildBridgesGateway;
//# sourceMappingURL=child-bridges.gateway.js.map