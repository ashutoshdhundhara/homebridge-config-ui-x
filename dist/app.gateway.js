"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const ws_guard_1 = require("./core/auth/guards/ws.guard");
let AppGateway = class AppGateway {
};
AppGateway = __decorate([
    (0, common_1.UseGuards)(ws_guard_1.WsGuard),
    (0, websockets_1.WebSocketGateway)({
        namespace: 'app', allowEIO3: true, cors: {
            origin: ['http://localhost:8080', 'http://localhost:4200'],
            credentials: true
        }
    })
], AppGateway);
exports.AppGateway = AppGateway;
//# sourceMappingURL=app.gateway.js.map