"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigEditorModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const config_editor_service_1 = require("./config-editor.service");
const config_editor_controller_1 = require("./config-editor.controller");
const config_module_1 = require("../../core/config/config.module");
const logger_module_1 = require("../../core/logger/logger.module");
const scheduler_module_1 = require("../../core/scheduler/scheduler.module");
const plugins_module_1 = require("../plugins/plugins.module");
let ConfigEditorModule = class ConfigEditorModule {
};
ConfigEditorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            logger_module_1.LoggerModule,
            config_module_1.ConfigModule,
            scheduler_module_1.SchedulerModule,
            plugins_module_1.PluginsModule,
        ],
        providers: [
            config_editor_service_1.ConfigEditorService,
        ],
        controllers: [
            config_editor_controller_1.ConfigEditorController,
        ],
        exports: [
            config_editor_service_1.ConfigEditorService,
        ],
    })
], ConfigEditorModule);
exports.ConfigEditorModule = ConfigEditorModule;
//# sourceMappingURL=config-editor.module.js.map