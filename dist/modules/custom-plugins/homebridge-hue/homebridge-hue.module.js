"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomebridgeHueModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const logger_module_1 = require("../../../core/logger/logger.module");
const config_module_1 = require("../../../core/config/config.module");
const homebridge_hue_controller_1 = require("./homebridge-hue.controller");
const homebridge_hue_service_1 = require("./homebridge-hue.service");
let HomebridgeHueModule = class HomebridgeHueModule {
};
HomebridgeHueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            config_module_1.ConfigModule,
            logger_module_1.LoggerModule,
        ],
        providers: [
            homebridge_hue_service_1.HomebridgeHueService,
        ],
        exports: [],
        controllers: [
            homebridge_hue_controller_1.HomebridgeHueController,
        ],
    })
], HomebridgeHueModule);
exports.HomebridgeHueModule = HomebridgeHueModule;
//# sourceMappingURL=homebridge-hue.module.js.map