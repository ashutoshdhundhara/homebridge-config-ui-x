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
exports.ServerController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const admin_guard_1 = require("../../core/auth/guards/admin.guard");
const child_bridges_service_1 = require("../child-bridges/child-bridges.service");
const server_service_1 = require("./server.service");
const server_dto_1 = require("./server.dto");
let ServerController = class ServerController {
    constructor(serverService, childBridgesService) {
        this.serverService = serverService;
        this.childBridgesService = childBridgesService;
    }
    restartServer() {
        return this.serverService.restartServer();
    }
    restartChildBridge(deviceId) {
        return this.childBridgesService.restartChildBridge(deviceId);
    }
    stopChildBridge(deviceId) {
        return this.childBridgesService.stopChildBridge(deviceId);
    }
    startChildBridge(deviceId) {
        return this.childBridgesService.startChildBridge(deviceId);
    }
    getBridgePairingInformation() {
        return this.serverService.getBridgePairingInformation();
    }
    resetHomebridgeAccessory() {
        return this.serverService.resetHomebridgeAccessory();
    }
    resetCachedAccessories() {
        return this.serverService.resetCachedAccessories();
    }
    getCachedAccessories() {
        return this.serverService.getCachedAccessories();
    }
    deleteCachedAccessory(uuid, cacheFile) {
        return this.serverService.deleteCachedAccessory(uuid, cacheFile);
    }
    getDevicePairings() {
        return this.serverService.getDevicePairings();
    }
    getDevicePairingById(deviceId) {
        return this.serverService.getDevicePairingById(deviceId);
    }
    deleteDevicePairing(deviceId) {
        return this.serverService.deleteDevicePairing(deviceId);
    }
    lookupUnusedPort() {
        return this.serverService.lookupUnusedPort();
    }
    getSystemNetworkInterfaces() {
        return this.serverService.getSystemNetworkInterfaces();
    }
    getHomebridgeNetworkInterfaces() {
        return this.serverService.getHomebridgeNetworkInterfaces();
    }
    setHomebridgeNetworkInterfaces(body) {
        return this.serverService.setHomebridgeNetworkInterfaces(body.adapters);
    }
    getHomebridgeMdnsSetting() {
        return this.serverService.getHomebridgeMdnsSetting();
    }
    setHomebridgeMdnsSetting(body) {
        return this.serverService.setHomebridgeMdnsSetting(body);
    }
};
__decorate([
    (0, common_1.Put)('/restart'),
    (0, swagger_1.ApiOperation)({ summary: 'Restart the Homebridge instance.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "restartServer", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Put)('/restart/:deviceId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Restart a child bridge instance.',
        description: 'This method is only supported on setups running hb-service.'
    }),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "restartChildBridge", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Put)('/stop/:deviceId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Stop a child bridge instance.',
        description: 'This method is only supported on setups running hb-service.'
    }),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "stopChildBridge", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Put)('/start/:deviceId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Start a child bridge instance.',
        description: 'This method is only supported on setups running hb-service.'
    }),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "startChildBridge", null);
__decorate([
    (0, common_1.Get)('/pairing'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the Homebridge HomeKit pairing information and status.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "getBridgePairingInformation", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Unpair / Reset the Homebridge instance and remove cached accessories.' }),
    (0, common_1.Put)('/reset-homebridge-accessory'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "resetHomebridgeAccessory", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Remove Homebridge cached accessories (hb-service only).' }),
    (0, common_1.Put)('/reset-cached-accessories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "resetCachedAccessories", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'List cached Homebridge accessories.' }),
    (0, common_1.Get)('/cached-accessories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "getCachedAccessories", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a single Homebridge cached accessory (hb-service only).' }),
    (0, swagger_1.ApiParam)({ name: 'uuid' }),
    (0, swagger_1.ApiQuery)({ name: 'cacheFile' }),
    (0, common_1.Delete)('/cached-accessories/:uuid'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('uuid')),
    __param(1, (0, common_1.Query)('cacheFile')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "deleteCachedAccessory", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'List all paired accessories (main bridge, external cameras, TVs etc).' }),
    (0, common_1.Get)('/pairings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "getDevicePairings", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single device pairing' }),
    (0, common_1.Get)('/pairings/:deviceId'),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "getDevicePairingById", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a single paired accessory (hb-service only).' }),
    (0, swagger_1.ApiParam)({ name: 'deviceId' }),
    (0, common_1.Delete)('/pairings/:deviceId'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "deleteDevicePairing", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Return a random, unused port.' }),
    (0, common_1.Get)('/port/new'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "lookupUnusedPort", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Return a list of available network interfaces on the server.' }),
    (0, common_1.Get)('/network-interfaces/system'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "getSystemNetworkInterfaces", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Return a list of the network interface names assigned to Homebridge.' }),
    (0, common_1.Get)('/network-interfaces/bridge'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "getHomebridgeNetworkInterfaces", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Set a list of the network interface names assigned to Homebridge.' }),
    (0, common_1.Put)('/network-interfaces/bridge'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [server_dto_1.HomebridgeNetworkInterfacesDto]),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "setHomebridgeNetworkInterfaces", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Return the current mdns advertiser settings.' }),
    (0, common_1.Get)('/mdns-advertiser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServerController.prototype, "getHomebridgeMdnsSetting", null);
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Set the mdns advertiser settings.' }),
    (0, common_1.Put)('/mdns-advertiser'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [server_dto_1.HomebridgeMdnsSettingDto]),
    __metadata("design:returntype", void 0)
], ServerController.prototype, "setHomebridgeMdnsSetting", null);
ServerController = __decorate([
    (0, swagger_1.ApiTags)('Homebridge'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    (0, common_1.Controller)('server'),
    __metadata("design:paramtypes", [server_service_1.ServerService,
        child_bridges_service_1.ChildBridgesService])
], ServerController);
exports.ServerController = ServerController;
//# sourceMappingURL=server.controller.js.map