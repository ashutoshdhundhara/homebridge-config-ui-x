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
exports.AccessoriesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const ws_guard_1 = require("../../core/auth/guards/ws.guard");
const accessories_service_1 = require("./accessories.service");
let AccessoriesGateway = class AccessoriesGateway {
    constructor(accessoriesService) {
        this.accessoriesService = accessoriesService;
    }
    connect(client, payload) {
        this.accessoriesService.connect(client);
    }
    async getAccessoryLayout(client, payload) {
        return await this.accessoriesService.getAccessoryLayout(payload.user);
    }
    async saveAccessoryLayout(client, payload) {
        try {
            return await this.accessoriesService.saveAccessoryLayout(payload.user, payload.layout);
        }
        catch (e) {
            return new websockets_1.WsException(e);
        }
    }
};
__decorate([
    (0, websockets_1.SubscribeMessage)('get-accessories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AccessoriesGateway.prototype, "connect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-layout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AccessoriesGateway.prototype, "getAccessoryLayout", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('save-layout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AccessoriesGateway.prototype, "saveAccessoryLayout", null);
AccessoriesGateway = __decorate([
    (0, common_1.UseGuards)(ws_guard_1.WsGuard),
    (0, websockets_1.WebSocketGateway)({
        namespace: 'accessories', allowEIO3: true, cors: {
            origin: ['http://localhost:8080', 'http://localhost:4200'],
            credentials: true
        }
    }),
    __metadata("design:paramtypes", [accessories_service_1.AccessoriesService])
], AccessoriesGateway);
exports.AccessoriesGateway = AccessoriesGateway;
//# sourceMappingURL=accessories.gateway.js.map