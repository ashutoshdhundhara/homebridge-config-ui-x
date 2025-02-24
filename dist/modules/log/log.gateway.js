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
exports.LogGateway = void 0;
const events_1 = require("events");
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const ws_guard_1 = require("../../core/auth/guards/ws.guard");
const log_service_1 = require("./log.service");
let LogGateway = class LogGateway {
    constructor(logService) {
        this.logService = logService;
    }
    connect(client, payload) {
        this.logService.connect(client, payload);
    }
};
__decorate([
    (0, websockets_1.SubscribeMessage)('tail-log'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [events_1.EventEmitter, Object]),
    __metadata("design:returntype", void 0)
], LogGateway.prototype, "connect", null);
LogGateway = __decorate([
    (0, common_1.UseGuards)(ws_guard_1.WsGuard),
    (0, websockets_1.WebSocketGateway)({
        namespace: 'log', allowEIO3: true, cors: {
            origin: ['http://localhost:8080', 'http://localhost:4200'],
            credentials: true
        }
    }),
    __metadata("design:paramtypes", [log_service_1.LogService])
], LogGateway);
exports.LogGateway = LogGateway;
//# sourceMappingURL=log.gateway.js.map