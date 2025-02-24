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
exports.ConfigEditorController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const config_editor_service_1 = require("./config-editor.service");
const admin_guard_1 = require("../../core/auth/guards/admin.guard");
let ConfigEditorController = class ConfigEditorController {
    constructor(configEditorService) {
        this.configEditorService = configEditorService;
    }
    getConfig() {
        return this.configEditorService.getConfigFile();
    }
    updateConfig(body) {
        return this.configEditorService.updateConfigFile(body);
    }
    getConfigForPlugin(pluginName) {
        return this.configEditorService.getConfigForPlugin(pluginName);
    }
    updateConfigForPlugin(pluginName, body) {
        return this.configEditorService.updateConfigForPlugin(pluginName, body);
    }
    disablePlugin(pluginName) {
        return this.configEditorService.disablePlugin(pluginName);
    }
    enablePlugin(pluginName) {
        return this.configEditorService.enablePlugin(pluginName);
    }
    listConfigBackups() {
        return this.configEditorService.listConfigBackups();
    }
    getBackup(backupId) {
        return this.configEditorService.getConfigBackup(backupId);
    }
    deleteAllConfigBackups() {
        return this.configEditorService.deleteAllConfigBackups();
    }
};
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Return the current Homebridge config.json file.' }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfigEditorController.prototype, "getConfig", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update the Homebridge config.json file.' }),
    (0, swagger_1.ApiBody)({ description: 'Homebridge config.json', type: 'json', isArray: false }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfigEditorController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Return the config blocks for a specific plugin.',
        description: 'An array of config blocks will be returned. An empty array will be returned if the plugin is not configured.',
    }),
    (0, common_1.Get)('/plugin/:pluginName'),
    __param(0, (0, common_1.Param)('pluginName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConfigEditorController.prototype, "getConfigForPlugin", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Replace the config for a specific plugin.',
        description: 'An array of all config blocks for the plugin must be provided, missing blocks will be removed. Sending an empty array will remove all plugin config.',
    }),
    (0, common_1.Post)('/plugin/:pluginName'),
    (0, swagger_1.ApiBody)({ description: 'Array of plugin config blocks', type: 'json', isArray: true }),
    __param(0, (0, common_1.Param)('pluginName')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ConfigEditorController.prototype, "updateConfigForPlugin", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark the plugin as disabled.',
    }),
    (0, swagger_1.ApiParam)({ name: 'pluginName', type: 'string' }),
    (0, common_1.Put)('plugin/:pluginName/disable'),
    __param(0, (0, common_1.Param)('pluginName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfigEditorController.prototype, "disablePlugin", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark the plugin as enabled.',
    }),
    (0, swagger_1.ApiParam)({ name: 'pluginName', type: 'string' }),
    (0, common_1.Put)('plugin/:pluginName/enable'),
    __param(0, (0, common_1.Param)('pluginName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfigEditorController.prototype, "enablePlugin", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'List the available Homebridge config.json backups.' }),
    (0, common_1.Get)('/backups'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfigEditorController.prototype, "listConfigBackups", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Return the Homebridge config.json file for the given backup ID.' }),
    (0, swagger_1.ApiParam)({ name: 'backupId', type: 'number' }),
    (0, common_1.Get)('/backups/:backupId(\\d+)'),
    __param(0, (0, common_1.Param)('backupId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConfigEditorController.prototype, "getBackup", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Delete all the Homebridge config.json backups.' }),
    (0, common_1.Delete)('/backups'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConfigEditorController.prototype, "deleteAllConfigBackups", null);
ConfigEditorController = __decorate([
    (0, swagger_1.ApiTags)('Homebridge Config Editor'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    (0, common_1.Controller)('config-editor'),
    __metadata("design:paramtypes", [config_editor_service_1.ConfigEditorService])
], ConfigEditorController);
exports.ConfigEditorController = ConfigEditorController;
//# sourceMappingURL=config-editor.controller.js.map