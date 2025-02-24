"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HbServiceModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const config_module_1 = require("../../../core/config/config.module");
const logger_module_1 = require("../../../core/logger/logger.module");
const hb_service_service_1 = require("./hb-service.service");
const hb_service_controller_1 = require("./hb-service.controller");
let HbServiceModule = class HbServiceModule {
};
HbServiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            config_module_1.ConfigModule,
            logger_module_1.LoggerModule,
        ],
        providers: [
            hb_service_service_1.HbServiceService,
        ],
        controllers: [
            hb_service_controller_1.HbServiceController,
        ],
    })
], HbServiceModule);
exports.HbServiceModule = HbServiceModule;
//# sourceMappingURL=hb-service.module.js.map