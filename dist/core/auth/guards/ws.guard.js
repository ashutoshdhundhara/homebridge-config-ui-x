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
exports.WsGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const config_service_1 = require("../../config/config.service");
let WsGuard = class WsGuard {
    constructor(configService) {
        this.configService = configService;
    }
    async canActivate(context) {
        const client = context.switchToWs().getClient();
        try {
            jwt.verify(client.handshake.query.token, this.configService.secrets.secretKey);
            return true;
        }
        catch (e) {
            client.disconnect();
            return false;
        }
    }
};
WsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], WsGuard);
exports.WsGuard = WsGuard;
//# sourceMappingURL=ws.guard.js.map