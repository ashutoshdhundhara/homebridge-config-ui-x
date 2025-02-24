"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomebridgeIpcModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../config/config.module");
const logger_module_1 = require("../logger/logger.module");
const homebridge_ipc_service_1 = require("./homebridge-ipc.service");
let HomebridgeIpcModule = class HomebridgeIpcModule {
};
HomebridgeIpcModule = __decorate([
    (0, common_1.Module)({
        imports: [
            logger_module_1.LoggerModule,
            config_module_1.ConfigModule,
        ],
        providers: [
            homebridge_ipc_service_1.HomebridgeIpcService
        ],
        exports: [
            homebridge_ipc_service_1.HomebridgeIpcService
        ],
    })
], HomebridgeIpcModule);
exports.HomebridgeIpcModule = HomebridgeIpcModule;
//# sourceMappingURL=homebridge-ipc.module.js.map