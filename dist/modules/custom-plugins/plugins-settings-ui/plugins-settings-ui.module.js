"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginsSettingsUiModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_module_1 = require("../../../core/config/config.module");
const logger_module_1 = require("../../../core/logger/logger.module");
const plugins_module_1 = require("../../plugins/plugins.module");
const plugins_settings_ui_controller_1 = require("./plugins-settings-ui.controller");
const plugins_settings_ui_gateway_1 = require("./plugins-settings-ui.gateway");
const plugins_settings_ui_service_1 = require("./plugins-settings-ui.service");
let PluginsSettingsUiModule = class PluginsSettingsUiModule {
};
PluginsSettingsUiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            logger_module_1.LoggerModule,
            plugins_module_1.PluginsModule,
            axios_1.HttpModule,
        ],
        providers: [
            plugins_settings_ui_service_1.PluginsSettingsUiService,
            plugins_settings_ui_gateway_1.PluginsSettingsUiGateway,
        ],
        controllers: [
            plugins_settings_ui_controller_1.PluginsSettingsUiController,
        ],
    })
], PluginsSettingsUiModule);
exports.PluginsSettingsUiModule = PluginsSettingsUiModule;
//# sourceMappingURL=plugins-settings-ui.module.js.map