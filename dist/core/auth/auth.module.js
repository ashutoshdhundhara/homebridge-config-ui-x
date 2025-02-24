"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const logger_module_1 = require("../logger/logger.module");
const config_module_1 = require("../config/config.module");
const config_service_1 = require("../config/config.service");
const jwt_strategy_1 = require("./jwt.strategy");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const ws_guard_1 = require("./guards/ws.guard");
const admin_guard_1 = require("./guards/admin.guard");
const ws_admin_guard_1 = require("./guards/ws-admin-guard");
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_module_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.secrets.secretKey,
                    signOptions: {
                        expiresIn: configService.ui.sessionTimeout,
                    },
                }),
                inject: [config_service_1.ConfigService],
            }),
            config_module_1.ConfigModule,
            logger_module_1.LoggerModule,
        ],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            ws_guard_1.WsGuard,
            ws_admin_guard_1.WsAdminGuard,
            admin_guard_1.AdminGuard,
        ],
        controllers: [
            auth_controller_1.AuthController,
        ],
        exports: [
            auth_service_1.AuthService,
        ],
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map