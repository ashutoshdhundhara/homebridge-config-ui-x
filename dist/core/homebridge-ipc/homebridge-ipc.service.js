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
exports.HomebridgeIpcService = void 0;
const common_1 = require("@nestjs/common");
const events_1 = require("events");
const config_service_1 = require("../config/config.service");
const logger_service_1 = require("../logger/logger.service");
let HomebridgeIpcService = class HomebridgeIpcService extends events_1.EventEmitter {
    constructor(logger, configService) {
        super();
        this.logger = logger;
        this.configService = configService;
        this.permittedEvents = [
            'childBridgeMetadataResponse',
            'childBridgeStatusUpdate',
            'serverStatusUpdate'
        ];
    }
    setHomebridgeProcess(process) {
        this.homebridge = process;
        this.homebridge.on('message', (message) => {
            if (typeof message !== 'object' || !message.id) {
                return;
            }
            if (this.permittedEvents.includes(message.id)) {
                this.emit(message.id, message.data);
            }
        });
        this.homebridge.on('close', () => {
            this.emit('serverStatusUpdate', { status: 'down' });
        });
    }
    setHomebridgeVersion(version) {
        this.configService.homebridgeVersion = version;
    }
    async requestResponse(requestEvent, responseEvent) {
        return new Promise((resolve, reject) => {
            const actionTimeout = setTimeout(() => {
                this.removeListener(responseEvent, listener);
                reject('The Homebridge service did not respond');
            }, 3000);
            const listener = (data) => {
                clearTimeout(actionTimeout);
                resolve(data);
            };
            this.once(responseEvent, listener);
            this.sendMessage(requestEvent);
        });
    }
    sendMessage(type, data) {
        if (this.homebridge && this.homebridge.connected) {
            this.homebridge.send({ id: type, data: data });
        }
        else {
            throw new common_1.ServiceUnavailableException('The Homebridge Service Is Unavailable');
        }
    }
    restartHomebridge() {
        if (this.homebridge) {
            this.logger.log('Sending SIGTERM to Homebridge');
            this.homebridge.kill('SIGTERM');
            const shutdownTimeout = setTimeout(() => {
                try {
                    this.logger.warn('Sending SIGKILL to Homebridge');
                    this.homebridge.kill('SIGKILL');
                }
                catch (e) { }
            }, 7000);
            this.homebridge.once('close', () => {
                clearTimeout(shutdownTimeout);
            });
        }
    }
    async restartAndWaitForClose() {
        if (!this.homebridge || !this.homebridge.connected) {
            return true;
        }
        else {
            return new Promise((resolve) => {
                this.homebridge.once('close', () => {
                    resolve(true);
                });
                this.restartHomebridge();
            });
        }
    }
    async killHomebridge() {
        if (this.homebridge) {
            this.logger.log('Sending SIGKILL to Homebridge');
            this.homebridge.kill('SIGKILL');
        }
    }
};
HomebridgeIpcService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.Logger,
        config_service_1.ConfigService])
], HomebridgeIpcService);
exports.HomebridgeIpcService = HomebridgeIpcService;
//# sourceMappingURL=homebridge-ipc.service.js.map