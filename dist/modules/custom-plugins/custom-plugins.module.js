"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomPluginsModule = void 0;
const common_1 = require("@nestjs/common");
const homebridge_hue_module_1 = require("./homebridge-hue/homebridge-hue.module");
const plugins_settings_ui_module_1 = require("./plugins-settings-ui/plugins-settings-ui.module");
let CustomPluginsModule = class CustomPluginsModule {
};
CustomPluginsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            homebridge_hue_module_1.HomebridgeHueModule,
            plugins_settings_ui_module_1.PluginsSettingsUiModule,
        ],
        controllers: [],
        providers: [],
    })
], CustomPluginsModule);
exports.CustomPluginsModule = CustomPluginsModule;
//# sourceMappingURL=custom-plugins.module.js.map