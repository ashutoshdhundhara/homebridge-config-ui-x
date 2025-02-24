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
exports.TerminalGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const ws_admin_guard_1 = require("../../../core/auth/guards/ws-admin-guard");
const terminal_service_1 = require("./terminal.service");
let TerminalGateway = class TerminalGateway {
    constructor(terminalService) {
        this.terminalService = terminalService;
    }
    startTerminalSession(client, payload) {
        return this.terminalService.startSession(client, payload);
    }
};
__decorate([
    (0, websockets_1.SubscribeMessage)('start-session'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TerminalGateway.prototype, "startTerminalSession", null);
TerminalGateway = __decorate([
    (0, common_1.UseGuards)(ws_admin_guard_1.WsAdminGuard),
    (0, websockets_1.WebSocketGateway)({
        namespace: 'platform-tools/terminal', allowEIO3: true, cors: {
            origin: ['http://localhost:8080', 'http://localhost:4200'],
            credentials: true
        }
    }),
    __metadata("design:paramtypes", [terminal_service_1.TerminalService])
], TerminalGateway);
exports.TerminalGateway = TerminalGateway;
//# sourceMappingURL=terminal.gateway.js.map