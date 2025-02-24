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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildBridgesService = void 0;
const common_1 = require("@nestjs/common");
const semver = require("semver");
const logger_service_1 = require("../../core/logger/logger.service");
const config_service_1 = require("../../core/config/config.service");
const homebridge_ipc_service_1 = require("../../core/homebridge-ipc/homebridge-ipc.service");
const accessories_service_1 = require("../accessories/accessories.service");
let ChildBridgesService = class ChildBridgesService {
    constructor(logger, configService, homebridgeIpcService, accessoriesService) {
        this.logger = logger;
        this.configService = configService;
        this.homebridgeIpcService = homebridgeIpcService;
        this.accessoriesService = accessoriesService;
    }
    async getChildBridges() {
        if (!this.configService.serviceMode) {
            throw new common_1.BadRequestException('This command is only available in service mode');
        }
        try {
            return await this.homebridgeIpcService.requestResponse('childBridgeMetadataRequest', 'childBridgeMetadataResponse');
        }
        catch (e) {
            return [];
        }
    }
    async watchChildBridgeStatus(client) {
        const listener = (data) => {
            client.emit('child-bridge-status-update', data);
        };
        this.homebridgeIpcService.on('childBridgeStatusUpdate', listener);
        const onEnd = () => {
            client.removeAllListeners('end');
            client.removeAllListeners('disconnect');
            this.homebridgeIpcService.removeListener('childBridgeStatusUpdate', listener);
        };
        client.on('end', onEnd.bind(this));
        client.on('disconnect', onEnd.bind(this));
    }
    stopStartRestartChildBridge(event, deviceId) {
        if (['startChildBridge', 'stopChildBridge'].includes(event)) {
            if (!semver.satisfies(this.configService.homebridgeVersion, '>=1.5.0-beta.2')) {
                this.logger.error('The stop child bridge requires Homebridge v1.5.0 or later');
                throw new common_1.BadRequestException('This command is only available for Homebridge v1.5.0 or later');
            }
        }
        if (!this.configService.serviceMode) {
            this.logger.error('The restart child bridge command is only available in service mode');
            throw new common_1.BadRequestException('This command is only available in service mode');
        }
        if (deviceId.length === 12) {
            deviceId = deviceId.match(/.{1,2}/g).join(':');
        }
        this.homebridgeIpcService.sendMessage(event, deviceId);
        setTimeout(() => {
            this.accessoriesService.resetInstancePool();
        }, 5000);
        return {
            ok: true
        };
    }
    restartChildBridge(deviceId) {
        return this.stopStartRestartChildBridge('restartChildBridge', deviceId);
    }
    stopChildBridge(deviceId) {
        return this.stopStartRestartChildBridge('stopChildBridge', deviceId);
    }
    startChildBridge(deviceId) {
        return this.stopStartRestartChildBridge('restartChildBridge', deviceId);
    }
};
ChildBridgesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.Logger,
        config_service_1.ConfigService,
        homebridge_ipc_service_1.HomebridgeIpcService,
        accessories_service_1.AccessoriesService])
], ChildBridgesService);
exports.ChildBridgesService = ChildBridgesService;
//# sourceMappingURL=child-bridges.service.js.map