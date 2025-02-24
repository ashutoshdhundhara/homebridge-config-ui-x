"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const config_module_1 = require("../../core/config/config.module");
const logger_module_1 = require("../../core/logger/logger.module");
const scheduler_module_1 = require("../../core/scheduler/scheduler.module");
const homebridge_ipc_module_1 = require("../../core/homebridge-ipc/homebridge-ipc.module");
const backup_service_1 = require("./backup.service");
const backup_gateway_1 = require("./backup.gateway");
const backup_controller_1 = require("./backup.controller");
const plugins_module_1 = require("../plugins/plugins.module");
let BackupModule = class BackupModule {
};
BackupModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            config_module_1.ConfigModule,
            plugins_module_1.PluginsModule,
            scheduler_module_1.SchedulerModule,
            logger_module_1.LoggerModule,
            homebridge_ipc_module_1.HomebridgeIpcModule,
        ],
        providers: [
            backup_service_1.BackupService,
            backup_gateway_1.BackupGateway,
        ],
        controllers: [
            backup_controller_1.BackupController,
        ],
    })
], BackupModule);
exports.BackupModule = BackupModule;
//# sourceMappingURL=backup.module.js.map