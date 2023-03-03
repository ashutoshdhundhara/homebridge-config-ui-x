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
exports.AccessoriesService = void 0;
const path = require("path");
const fs = require("fs-extra");
const NodeCache = require("node-cache");
const common_1 = require("@nestjs/common");
const hap_client_1 = require("@oznu/hap-client");
const config_service_1 = require("../../core/config/config.service");
const logger_service_1 = require("../../core/logger/logger.service");
let AccessoriesService = class AccessoriesService {
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        this.accessoriesCache = new NodeCache({ stdTTL: 0 });
        if (this.configService.homebridgeInsecureMode) {
            this.hapClient = new hap_client_1.HapClient({
                pin: this.configService.homebridgeConfig.bridge.pin,
                logger: this.logger,
                config: this.configService.ui.accessoryControl || {},
            });
        }
    }
    async connect(client) {
        if (!this.configService.homebridgeInsecureMode) {
            this.logger.error('Homebridge must be running in insecure mode to control accessories');
            return;
        }
        let services;
        const loadAllAccessories = async (refresh) => {
            if (!refresh) {
                const cached = this.accessoriesCache.get('services');
                if (cached && cached.length) {
                    client.emit('accessories-data', cached);
                }
            }
            services = await this.loadAccessories();
            this.refreshCharacteristics(services);
            client.emit('accessories-ready-for-control');
            client.emit('accessories-data', services);
            this.accessoriesCache.set('services', services);
        };
        await loadAllAccessories(false);
        const requestHandler = async (msg) => {
            if (msg.set) {
                const service = services.find(x => x.uniqueId === msg.set.uniqueId);
                if (service) {
                    try {
                        await service.setCharacteristic(msg.set.iid, msg.set.value);
                        services = await this.loadAccessories();
                        setTimeout(() => {
                            this.refreshCharacteristics(services);
                        }, 1500);
                    }
                    catch (e) {
                        client.emit('accessory-control-failure', e.message);
                    }
                }
            }
        };
        client.on('accessory-control', requestHandler);
        const monitor = await this.hapClient.monitorCharacteristics();
        const updateHandler = (data) => {
            client.emit('accessories-data', data);
        };
        monitor.on('service-update', updateHandler);
        const instanceUpdateHandler = async (data) => {
            client.emit('accessories-reload-required', services);
        };
        this.hapClient.on('instance-discovered', instanceUpdateHandler);
        const secondaryLoadTimeout = setTimeout(async () => {
            await loadAllAccessories(true);
        }, 3000);
        const onEnd = () => {
            clearTimeout(secondaryLoadTimeout);
            client.removeAllListeners('end');
            client.removeAllListeners('disconnect');
            client.removeAllListeners('accessory-control');
            monitor.removeAllListeners('service-update');
            monitor.finish();
            this.hapClient.removeListener('instance-discovered', instanceUpdateHandler);
        };
        client.on('disconnect', onEnd.bind(this));
        client.on('end', onEnd.bind(this));
        this.hapClient.refreshInstances();
    }
    refreshCharacteristics(services) {
        services.forEach(service => service.refreshCharacteristics());
    }
    async loadAccessories() {
        if (!this.configService.homebridgeInsecureMode) {
            throw new common_1.BadRequestException('Homebridge must be running in insecure mode to access accessories.');
        }
        return this.hapClient.getAllServices()
            .then(services => {
            return services;
        })
            .catch((e) => {
            var _a;
            if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
                this.logger.warn('Homebridge must be running in insecure mode to view and control accessories from this plugin.');
            }
            else {
                this.logger.error(`Failed load accessories from Homebridge: ${e.message}`);
            }
            return [];
        });
    }
    async getAccessory(uniqueId) {
        const services = await this.loadAccessories();
        const service = services.find(x => x.uniqueId === uniqueId);
        if (!service) {
            throw new common_1.BadRequestException(`Service with uniqueId of '${uniqueId}' not found.`);
        }
        try {
            await service.refreshCharacteristics();
            return service;
        }
        catch (e) {
            throw new common_1.BadRequestException(e.message);
        }
    }
    async setAccessoryCharacteristic(uniqueId, characteristicType, value) {
        const services = await this.loadAccessories();
        const service = services.find(x => x.uniqueId === uniqueId);
        if (!service) {
            throw new common_1.BadRequestException(`Service with uniqueId of '${uniqueId}' not found.`);
        }
        const characteristic = service.getCharacteristic(characteristicType);
        if (!characteristic || !characteristic.canWrite) {
            const types = service.serviceCharacteristics.filter(x => x.canWrite).map(x => `'${x.type}'`).join(', ');
            throw new common_1.BadRequestException(`Invalid characteristicType. Valid types are: ${types}.`);
        }
        if (['uint8', 'uint16', 'uint32', 'uint64'].includes(characteristic.format)) {
            value = parseInt(value, 10);
            if (characteristic.minValue !== undefined && value < characteristic.minValue) {
                throw new common_1.BadRequestException(`Invalid value. The value must be between ${characteristic.minValue} and ${characteristic.maxValue}.`);
            }
            if (characteristic.maxValue !== undefined && value > characteristic.maxValue) {
                throw new common_1.BadRequestException(`Invalid value. The value must be between ${characteristic.minValue} and ${characteristic.maxValue}.`);
            }
        }
        if (characteristic.format === 'float') {
            value = parseFloat(value);
            if (characteristic.minValue !== undefined && value < characteristic.minValue) {
                throw new common_1.BadRequestException(`Invalid value. The value must be between ${characteristic.minValue} and ${characteristic.maxValue}.`);
            }
            if (characteristic.maxValue !== undefined && value > characteristic.maxValue) {
                throw new common_1.BadRequestException(`Invalid value. The value must be between ${characteristic.minValue} and ${characteristic.maxValue}.`);
            }
        }
        if (characteristic.format === 'bool') {
            if (typeof value === 'string') {
                if (['true', '1'].includes(value.toLowerCase())) {
                    value = true;
                }
                else if (['false', '0'].includes(value.toLowerCase())) {
                    value = false;
                }
            }
            else if (typeof value === 'number') {
                value = value === 1 ? true : false;
            }
            if (typeof value !== 'boolean') {
                throw new common_1.BadRequestException('Invalid value. The value must be a boolean (true or false).');
            }
        }
        try {
            await characteristic.setValue(value);
            await service.refreshCharacteristics();
            return service;
        }
        catch (e) {
            throw new common_1.BadRequestException(e.message);
        }
    }
    async getAccessoryLayout(username) {
        try {
            const accessoryLayout = await fs.readJson(this.configService.accessoryLayoutPath);
            if (username in accessoryLayout) {
                return accessoryLayout[username];
            }
            else {
                throw new Error('User not in Acccessory Layout');
            }
        }
        catch (e) {
            return [
                {
                    name: 'Default Room',
                    services: [],
                },
            ];
        }
    }
    async saveAccessoryLayout(user, layout) {
        let accessoryLayout;
        try {
            accessoryLayout = await fs.readJson(this.configService.accessoryLayoutPath);
        }
        catch (e) {
            accessoryLayout = {};
        }
        if (!await fs.pathExists(path.join(this.configService.storagePath, 'accessories'))) {
            await fs.mkdirp(path.join(this.configService.storagePath, 'accessories'));
        }
        accessoryLayout[user] = layout;
        fs.writeJsonSync(this.configService.accessoryLayoutPath, accessoryLayout);
        this.logger.log(`[${user}] Accessory layout changes saved.`);
        return layout;
    }
    resetInstancePool() {
        if (this.configService.homebridgeInsecureMode) {
            this.hapClient.resetInstancePool();
        }
    }
};
AccessoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        logger_service_1.Logger])
], AccessoriesService);
exports.AccessoriesService = AccessoriesService;
//# sourceMappingURL=accessories.service.js.map