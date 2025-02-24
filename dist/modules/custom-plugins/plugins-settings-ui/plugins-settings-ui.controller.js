"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginsSettingsUiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const plugins_settings_ui_service_1 = require("./plugins-settings-ui.service");
let PluginsSettingsUiController = class PluginsSettingsUiController {
    constructor(pluginSettingsUiService) {
        this.pluginSettingsUiService = pluginSettingsUiService;
    }
    async serveCustomUiAsset(reply, pluginName, file, origin, v) {
        return await this.pluginSettingsUiService.serveCustomUiAsset(reply, pluginName, file, origin, v);
    }
};
__decorate([
    (0, common_1.Get)('/:pluginName/*'),
    (0, swagger_1.ApiOperation)({ summary: 'Returns the HTML assets for a plugin\'s custom UI' }),
    (0, swagger_1.ApiParam)({ name: 'pluginName', type: 'string' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('pluginName')),
    __param(2, (0, common_1.Param)('*')),
    __param(3, (0, common_1.Query)('origin')),
    __param(4, (0, common_1.Query)('v')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], PluginsSettingsUiController.prototype, "serveCustomUiAsset", null);
PluginsSettingsUiController = __decorate([
    (0, swagger_1.ApiTags)('Plugins'),
    (0, common_1.Controller)('plugins/settings-ui'),
    __metadata("design:paramtypes", [plugins_settings_ui_service_1.PluginsSettingsUiService])
], PluginsSettingsUiController);
exports.PluginsSettingsUiController = PluginsSettingsUiController;
//# sourceMappingURL=plugins-settings-ui.controller.js.map