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
exports.PluginsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const plugins_service_1 = require("./plugins.service");
const admin_guard_1 = require("../../core/auth/guards/admin.guard");
let PluginsController = class PluginsController {
    constructor(pluginsService) {
        this.pluginsService = pluginsService;
    }
    pluginsGet() {
        return this.pluginsService.getInstalledPlugins();
    }
    pluginsSearch(query) {
        return this.pluginsService.searchNpmRegistry(query.trim());
    }
    pluginLookup(pluginName) {
        return this.pluginsService.lookupPlugin(pluginName);
    }
    getAvailablePluginVersions(pluginName) {
        return this.pluginsService.getAvailablePluginVersions(pluginName);
    }
    getPluginConfigSchema(pluginName) {
        try {
            return this.pluginsService.getPluginConfigSchema(pluginName);
        }
        catch (e) {
            console.log('did throw error');
            console.error(e);
        }
        return;
    }
    getPluginChangeLog(pluginName) {
        return this.pluginsService.getPluginChangeLog(pluginName);
    }
    getPluginRelease(pluginName) {
        return this.pluginsService.getPluginRelease(pluginName);
    }
    getPluginAlias(pluginName) {
        return this.pluginsService.getPluginAlias(pluginName);
    }
};
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'List of currently installed Homebridge plugins.' }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "pluginsGet", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Search the NPM registry for Homebridge plugins.' }),
    (0, swagger_1.ApiParam)({ name: 'query', type: 'string' }),
    (0, common_1.Get)('search/:query'),
    __param(0, (0, common_1.Param)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "pluginsSearch", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Lookup a single plugin from the NPM registry.' }),
    (0, swagger_1.ApiParam)({ name: 'pluginName', type: 'string' }),
    (0, common_1.Get)('lookup/:pluginName'),
    __param(0, (0, common_1.Param)('pluginName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "pluginLookup", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get the available versions and tags for a single plugin from the NPM registry.' }),
    (0, swagger_1.ApiParam)({ name: 'pluginName', type: 'string' }),
    (0, common_1.Get)('lookup/:pluginName/versions'),
    __param(0, (0, common_1.Param)('pluginName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "getAvailablePluginVersions", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get the config.schema.json for a plugin.' }),
    (0, swagger_1.ApiParam)({ name: 'pluginName', type: 'string' }),
    (0, common_1.Get)('config-schema/:pluginName'),
    __param(0, (0, common_1.Param)('pluginName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "getPluginConfigSchema", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get the CHANGELOG.md (post install) for a plugin.' }),
    (0, swagger_1.ApiParam)({ name: 'pluginName', type: 'string' }),
    (0, common_1.Get)('changelog/:pluginName'),
    __param(0, (0, common_1.Param)('pluginName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "getPluginChangeLog", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get the latest GitHub release notes for a plugin.' }),
    (0, swagger_1.ApiParam)({ name: 'pluginName', type: 'string' }),
    (0, common_1.Get)('release/:pluginName'),
    __param(0, (0, common_1.Param)('pluginName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "getPluginRelease", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Attempt to resolve the type (platform or accessory) and alias for a plugin.',
        description: '**Warning**: pluginAlias and pluginType will be `null` if the type or alias could not be resolved.',
    }),
    (0, swagger_1.ApiParam)({ name: 'pluginName', type: 'string' }),
    (0, common_1.Get)('alias/:pluginName'),
    __param(0, (0, common_1.Param)('pluginName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "getPluginAlias", null);
PluginsController = __decorate([
    (0, swagger_1.ApiTags)('Plugins'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    (0, common_1.Controller)('plugins'),
    __metadata("design:paramtypes", [plugins_service_1.PluginsService])
], PluginsController);
exports.PluginsController = PluginsController;
//# sourceMappingURL=plugins.controller.js.map