"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const logger_module_1 = require("./core/logger/logger.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const app_gateway_1 = require("./app.gateway");
const config_module_1 = require("./core/config/config.module");
const plugins_module_1 = require("./modules/plugins/plugins.module");
const custom_plugins_module_1 = require("./modules/custom-plugins/custom-plugins.module");
const users_module_1 = require("./modules/users/users.module");
const status_module_1 = require("./modules/status/status.module");
const log_module_1 = require("./modules/log/log.module");
const accessories_module_1 = require("./modules/accessories/accessories.module");
const config_editor_module_1 = require("./modules/config-editor/config-editor.module");
const auth_module_1 = require("./core/auth/auth.module");
const server_module_1 = require("./modules/server/server.module");
const platform_tools_module_1 = require("./modules/platform-tools/platform-tools.module");
const backup_module_1 = require("./modules/backup/backup.module");
const setup_wizard_module_1 = require("./modules/setup-wizard/setup-wizard.module");
const child_bridges_module_1 = require("./modules/child-bridges/child-bridges.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            logger_module_1.LoggerModule,
            auth_module_1.AuthModule,
            server_module_1.ServerModule,
            plugins_module_1.PluginsModule,
            custom_plugins_module_1.CustomPluginsModule,
            users_module_1.UsersModule,
            status_module_1.StatusModule,
            accessories_module_1.AccessoriesModule,
            config_editor_module_1.ConfigEditorModule,
            platform_tools_module_1.PlatformToolsModule,
            child_bridges_module_1.ChildBridgesModule,
            backup_module_1.BackupModule,
            log_module_1.LogModule,
            setup_wizard_module_1.SetupWizardModule,
        ],
        controllers: [
            app_controller_1.AppController,
        ],
        providers: [
            app_service_1.AppService,
            app_gateway_1.AppGateway,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map