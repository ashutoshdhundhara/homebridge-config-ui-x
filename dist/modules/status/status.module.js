"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const passport_1 = require("@nestjs/passport");
const plugins_module_1 = require("../plugins/plugins.module");
const config_module_1 = require("../../core/config/config.module");
const logger_module_1 = require("../../core/logger/logger.module");
const homebridge_ipc_module_1 = require("../../core/homebridge-ipc/homebridge-ipc.module");
const child_bridges_module_1 = require("../child-bridges/child-bridges.module");
const server_module_1 = require("../server/server.module");
const status_service_1 = require("./status.service");
const status_gateway_1 = require("./status.gateway");
const status_controller_1 = require("./status.controller");
let StatusModule = class StatusModule {
};
StatusModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            axios_1.HttpModule,
            logger_module_1.LoggerModule,
            plugins_module_1.PluginsModule,
            config_module_1.ConfigModule,
            server_module_1.ServerModule,
            homebridge_ipc_module_1.HomebridgeIpcModule,
            child_bridges_module_1.ChildBridgesModule,
        ],
        providers: [
            status_service_1.StatusService,
            status_gateway_1.StatusGateway,
        ],
        controllers: [
            status_controller_1.StatusController,
        ],
    })
], StatusModule);
exports.StatusModule = StatusModule;
//# sourceMappingURL=status.module.js.map