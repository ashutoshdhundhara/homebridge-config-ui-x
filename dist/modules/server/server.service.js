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
exports.ServerService = void 0;
const fs = require("fs-extra");
const path = require("path");
const bufferShim = require("buffer-shims");
const si = require("systeminformation");
const NodeCache = require("node-cache");
const child_process = require("child_process");
const tcpPortUsed = require("tcp-port-used");
const common_1 = require("@nestjs/common");
const hap_types_1 = require("@oznu/hap-client/dist/hap-types");
const logger_service_1 = require("../../core/logger/logger.service");
const config_service_1 = require("../../core/config/config.service");
const homebridge_ipc_service_1 = require("../../core/homebridge-ipc/homebridge-ipc.service");
const config_editor_service_1 = require("../config-editor/config-editor.service");
const accessories_service_1 = require("../accessories/accessories.service");
let ServerService = class ServerService {
    constructor(configService, configEditorService, accessoriesService, homebridgeIpcService, logger) {
        this.configService = configService;
        this.configEditorService = configEditorService;
        this.accessoriesService = accessoriesService;
        this.homebridgeIpcService = homebridgeIpcService;
        this.logger = logger;
        this.serverServiceCache = new NodeCache({ stdTTL: 300 });
        this.accessoryId = this.configService.homebridgeConfig.bridge.username.split(':').join('');
        this.accessoryInfoPath = path.join(this.configService.storagePath, 'persist', `AccessoryInfo.${this.accessoryId}.json`);
        this.setupCode = null;
    }
    async restartServer() {
        this.logger.log('Homebridge restart request received');
        if (this.configService.serviceMode && !(await this.configService.uiRestartRequired() || await this.nodeVersionChanged())) {
            this.logger.log('UI / Bridge settings have not changed; only restarting Homebridge process');
            this.homebridgeIpcService.restartHomebridge();
            this.accessoriesService.resetInstancePool();
            return { ok: true, command: 'SIGTERM', restartingUI: false };
        }
        setTimeout(() => {
            if (this.configService.ui.restart) {
                this.logger.log(`Executing restart command: ${this.configService.ui.restart}`);
                child_process.exec(this.configService.ui.restart, (err) => {
                    if (err) {
                        this.logger.log('Restart command exited with an error. Failed to restart Homebridge.');
                    }
                });
            }
            else {
                this.logger.log('Sending SIGTERM to process...');
                process.kill(process.pid, 'SIGTERM');
            }
        }, 500);
        return { ok: true, command: this.configService.ui.restart, restartingUI: true };
    }
    async resetHomebridgeAccessory() {
        this.configService.hbServiceUiRestartRequired = true;
        const configFile = await this.configEditorService.getConfigFile();
        configFile.bridge.pin = this.configEditorService.generatePin();
        configFile.bridge.username = this.configEditorService.generateUsername();
        this.logger.warn(`Homebridge Reset: New Username: ${configFile.bridge.username}`);
        this.logger.warn(`Homebridge Reset: New Pin: ${configFile.bridge.pin}`);
        await this.configEditorService.updateConfigFile(configFile);
        await fs.remove(path.resolve(this.configService.storagePath, 'accessories'));
        await fs.remove(path.resolve(this.configService.storagePath, 'persist'));
        this.logger.log('Homebridge Reset: "persist" directory removed.');
        this.logger.log('Homebridge Reset: "accessories" directory removed.');
    }
    async getDevicePairings() {
        const persistPath = path.join(this.configService.storagePath, 'persist');
        const devices = (await fs.readdir(persistPath))
            .filter(x => x.match(/AccessoryInfo\.([A-F,a-f,0-9]+)\.json/));
        return Promise.all(devices.map(async (x) => {
            return await this.getDevicePairingById(x.split('.')[1]);
        }));
    }
    async getDevicePairingById(deviceId) {
        const persistPath = path.join(this.configService.storagePath, 'persist');
        let device;
        try {
            device = await fs.readJson(path.join(persistPath, `AccessoryInfo.${deviceId}.json`));
        }
        catch (e) {
            throw new common_1.NotFoundException();
        }
        device._id = deviceId;
        device._username = device._id.match(/.{1,2}/g).join(':');
        device._main = this.configService.homebridgeConfig.bridge.username.toUpperCase() === device._username.toUpperCase();
        device._isPaired = device.pairedClients && Object.keys(device.pairedClients).length > 0;
        device._setupCode = this.generateSetupCode(device);
        delete device.signSk;
        delete device.signPk;
        delete device.configHash;
        delete device.pairedClients;
        delete device.pairedClientsPermission;
        try {
            device._category = Object.entries(hap_types_1.Categories).find(([name, value]) => value === device.category)[0].toLowerCase();
        }
        catch (e) {
            device._category = 'Other';
        }
        return device;
    }
    async deleteDevicePairing(id) {
        const persistPath = path.join(this.configService.storagePath, 'persist');
        const cachedAccessoriesDir = path.join(this.configService.storagePath, 'accessories');
        const accessoryInfo = path.join(persistPath, 'AccessoryInfo.' + id + '.json');
        const identifierCache = path.join(persistPath, 'IdentifierCache.' + id + '.json');
        const cachedAccessories = path.join(cachedAccessoriesDir, 'cachedAccessories.' + id);
        const cachedAccessoriesBackup = path.join(cachedAccessoriesDir, '.cachedAccessories.' + id + '.bak');
        if (await fs.pathExists(accessoryInfo)) {
            await fs.unlink(accessoryInfo);
            this.logger.warn(`Removed ${accessoryInfo}`);
        }
        if (await fs.pathExists(identifierCache)) {
            await fs.unlink(identifierCache);
            this.logger.warn(`Removed ${identifierCache}`);
        }
        if (await fs.pathExists(cachedAccessories)) {
            await fs.unlink(cachedAccessories);
            this.logger.warn(`Removed ${cachedAccessories}`);
        }
        if (await fs.pathExists(cachedAccessoriesBackup)) {
            await fs.unlink(cachedAccessoriesBackup);
            this.logger.warn(`Removed ${cachedAccessoriesBackup}`);
        }
        return;
    }
    async getCachedAccessories() {
        const cachedAccessoriesDir = path.join(this.configService.storagePath, 'accessories');
        const cachedAccessoryFiles = (await fs.readdir(cachedAccessoriesDir))
            .filter(x => x.match(/^cachedAccessories\.([A-F,0-9]+)$/) || x === 'cachedAccessories');
        const cachedAccessories = [];
        await Promise.all(cachedAccessoryFiles.map(async (x) => {
            const accessories = await fs.readJson(path.join(cachedAccessoriesDir, x));
            for (const accessory of accessories) {
                accessory.$cacheFile = x;
                cachedAccessories.push(accessory);
            }
        }));
        return cachedAccessories;
    }
    async deleteCachedAccessory(uuid, cacheFile) {
        cacheFile = cacheFile || 'cachedAccessories';
        if (!this.configService.serviceMode) {
            this.logger.error('The reset accessories cache command is only available in service mode');
            throw new common_1.BadRequestException('This command is only available in service mode');
        }
        const cachedAccessoriesPath = path.resolve(this.configService.storagePath, 'accessories', cacheFile);
        this.logger.warn(`Shutting down Homebridge before removing cached accessory: ${uuid}`);
        await this.homebridgeIpcService.restartAndWaitForClose();
        const cachedAccessories = await fs.readJson(cachedAccessoriesPath);
        const accessoryIndex = cachedAccessories.findIndex(x => x.UUID === uuid);
        if (accessoryIndex > -1) {
            cachedAccessories.splice(accessoryIndex, 1);
            await fs.writeJson(cachedAccessoriesPath, cachedAccessories);
            this.logger.warn(`Removed cached accessory with UUID: ${uuid}`);
        }
        else {
            this.logger.error(`Cannot find cached accessory with UUID: ${uuid}`);
            throw new common_1.NotFoundException();
        }
        return { ok: true };
    }
    async resetCachedAccessories() {
        if (!this.configService.serviceMode) {
            this.logger.error('The reset accessories cache command is only available in service mode');
            throw new common_1.BadRequestException('This command is only available in service mode');
        }
        const cachedAccessoriesDir = path.join(this.configService.storagePath, 'accessories');
        const cachedAccessoryPaths = (await fs.readdir(cachedAccessoriesDir))
            .filter(x => x.match(/cachedAccessories\.([A-F,0-9]+)/) || x === 'cachedAccessories' || x === '.cachedAccessories.bak')
            .map(x => path.resolve(cachedAccessoriesDir, x));
        const cachedAccessoriesPath = path.resolve(this.configService.storagePath, 'accessories', 'cachedAccessories');
        await this.homebridgeIpcService.restartAndWaitForClose();
        this.logger.warn('Shutting down Homebridge before removing cached accessories');
        try {
            this.logger.log('Clearing Cached Homebridge Accessories...');
            for (const cachedAccessoriesPath of cachedAccessoryPaths) {
                if (await fs.pathExists(cachedAccessoriesPath)) {
                    await fs.unlink(cachedAccessoriesPath);
                    this.logger.warn(`Removed ${cachedAccessoriesPath}`);
                }
            }
        }
        catch (e) {
            this.logger.error(`Failed to clear Homebridge Accessories Cache at ${cachedAccessoriesPath}`);
            console.error(e);
            throw new common_1.InternalServerErrorException('Failed to clear Homebridge accessory cache - see logs.');
        }
        return { ok: true };
    }
    async getSetupCode() {
        if (this.setupCode) {
            return this.setupCode;
        }
        else {
            if (!await fs.pathExists(this.accessoryInfoPath)) {
                return null;
            }
            const accessoryInfo = await fs.readJson(this.accessoryInfoPath);
            this.setupCode = this.generateSetupCode(accessoryInfo);
            return this.setupCode;
        }
    }
    generateSetupCode(accessoryInfo) {
        const buffer = bufferShim.alloc(8);
        const setupCode = parseInt(accessoryInfo.pincode.replace(/-/g, ''), 10);
        let valueLow = setupCode;
        const valueHigh = accessoryInfo.category >> 1;
        valueLow |= 1 << 28;
        buffer.writeUInt32BE(valueLow, 4);
        if (accessoryInfo.category & 1) {
            buffer[4] = buffer[4] | 1 << 7;
        }
        buffer.writeUInt32BE(valueHigh, 0);
        let encodedPayload = (buffer.readUInt32BE(4) + (buffer.readUInt32BE(0) * Math.pow(2, 32))).toString(36).toUpperCase();
        if (encodedPayload.length !== 9) {
            for (let i = 0; i <= 9 - encodedPayload.length; i++) {
                encodedPayload = '0' + encodedPayload;
            }
        }
        return 'X-HM://' + encodedPayload + accessoryInfo.setupID;
    }
    async getBridgePairingInformation() {
        if (!await fs.pathExists(this.accessoryInfoPath)) {
            return new common_1.ServiceUnavailableException('Pairing Information Not Available Yet');
        }
        const accessoryInfo = await fs.readJson(this.accessoryInfoPath);
        return {
            displayName: accessoryInfo.displayName,
            pincode: accessoryInfo.pincode,
            setupCode: await this.getSetupCode(),
            isPaired: accessoryInfo.pairedClients && Object.keys(accessoryInfo.pairedClients).length > 0,
        };
    }
    async getSystemNetworkInterfaces() {
        const fromCache = this.serverServiceCache.get('network-interfaces');
        const networkInterfaces = fromCache || (await si.networkInterfaces()).filter((adapter) => {
            return !adapter.internal
                && (adapter.ip4 || (adapter.ip6));
        });
        if (!fromCache) {
            this.serverServiceCache.set('network-interfaces', networkInterfaces);
        }
        return networkInterfaces;
    }
    async getHomebridgeNetworkInterfaces() {
        var _a, _b, _c;
        const config = await this.configEditorService.getConfigFile();
        if (!((_a = config.bridge) === null || _a === void 0 ? void 0 : _a.bind)) {
            return [];
        }
        if (Array.isArray((_b = config.bridge) === null || _b === void 0 ? void 0 : _b.bind)) {
            return config.bridge.bind;
        }
        if (typeof ((_c = config.bridge) === null || _c === void 0 ? void 0 : _c.bind) === 'string') {
            return [config.bridge.bind];
        }
        return [];
    }
    async getHomebridgeMdnsSetting() {
        const config = await this.configEditorService.getConfigFile();
        if (!config.bridge.advertiser) {
            config.bridge.advertiser = 'bonjour-hap';
        }
        return {
            advertiser: config.bridge.advertiser
        };
    }
    async setHomebridgeMdnsSetting(setting) {
        const config = await this.configEditorService.getConfigFile();
        config.bridge.advertiser = setting.advertiser;
        await this.configEditorService.updateConfigFile(config);
        return;
    }
    async setHomebridgeNetworkInterfaces(adapters) {
        const config = await this.configEditorService.getConfigFile();
        if (!config.bridge) {
            config.bridge = {};
        }
        if (!adapters.length) {
            delete config.bridge.bind;
        }
        else {
            config.bridge.bind = adapters;
        }
        await this.configEditorService.updateConfigFile(config);
        return;
    }
    async lookupUnusedPort() {
        const randomPort = () => Math.floor(Math.random() * (60000 - 30000 + 1) + 30000);
        let port = randomPort();
        while (await tcpPortUsed.check(port)) {
            port = randomPort();
        }
        return { port };
    }
    async nodeVersionChanged() {
        return new Promise((resolve, reject) => {
            let result = false;
            const child = child_process.spawn(process.execPath, ['-v']);
            child.stdout.once('data', (data) => {
                if (data.toString().trim() === process.version) {
                    result = false;
                }
                else {
                    result = true;
                }
            });
            child.on('error', () => {
                result = true;
            });
            child.on('close', () => {
                return resolve(result);
            });
        });
    }
};
ServerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        config_editor_service_1.ConfigEditorService,
        accessories_service_1.AccessoriesService,
        homebridge_ipc_service_1.HomebridgeIpcService,
        logger_service_1.Logger])
], ServerService);
exports.ServerService = ServerService;
//# sourceMappingURL=server.service.js.map