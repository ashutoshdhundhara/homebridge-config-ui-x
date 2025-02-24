"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginsModule = void 0;
const https = require("https");
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const passport_1 = require("@nestjs/passport");
const plugins_service_1 = require("./plugins.service");
const logger_module_1 = require("../../core/logger/logger.module");
const plugins_controller_1 = require("./plugins.controller");
const plugins_gateway_1 = require("./plugins.gateway");
const config_module_1 = require("../../core/config/config.module");
const node_pty_module_1 = require("../../core/node-pty/node-pty.module");
let PluginsModule = class PluginsModule {
};
PluginsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            axios_1.HttpModule.register({
                headers: {
                    'User-Agent': 'homebridge-config-ui-x',
                },
                timeout: 10000,
                httpsAgent: new https.Agent({ keepAlive: true }),
            }),
            node_pty_module_1.NodePtyModule,
            config_module_1.ConfigModule,
            logger_module_1.LoggerModule,
        ],
        providers: [
            plugins_service_1.PluginsService,
            plugins_gateway_1.PluginsGateway,
        ],
        exports: [
            plugins_service_1.PluginsService,
        ],
        controllers: [
            plugins_controller_1.PluginsController,
        ],
    })
], PluginsModule);
exports.PluginsModule = PluginsModule;
//# sourceMappingURL=plugins.module.js.map