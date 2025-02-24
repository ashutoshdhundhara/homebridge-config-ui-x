"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildBridgesModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const logger_module_1 = require("../../core/logger/logger.module");
const config_module_1 = require("../../core/config/config.module");
const homebridge_ipc_module_1 = require("../../core/homebridge-ipc/homebridge-ipc.module");
const accessories_module_1 = require("../accessories/accessories.module");
const child_bridges_gateway_1 = require("./child-bridges.gateway");
const child_bridges_service_1 = require("./child-bridges.service");
let ChildBridgesModule = class ChildBridgesModule {
};
ChildBridgesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            logger_module_1.LoggerModule,
            config_module_1.ConfigModule,
            accessories_module_1.AccessoriesModule,
            homebridge_ipc_module_1.HomebridgeIpcModule,
        ],
        providers: [
            child_bridges_service_1.ChildBridgesService,
            child_bridges_gateway_1.ChildBridgesGateway,
        ],
        exports: [
            child_bridges_service_1.ChildBridgesService,
        ]
    })
], ChildBridgesModule);
exports.ChildBridgesModule = ChildBridgesModule;
//# sourceMappingURL=child-bridges.module.js.map