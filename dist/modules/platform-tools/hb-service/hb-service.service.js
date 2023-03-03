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
exports.HbServiceService = void 0;
const fs = require("fs-extra");
const path = require("path");
const stream = require("stream");
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../../core/config/config.service");
const logger_service_1 = require("../../../core/logger/logger.service");
let HbServiceService = class HbServiceService {
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
        this.hbServiceSettingsPath = path.resolve(this.configService.storagePath, '.uix-hb-service-homebridge-startup.json');
    }
    async getHomebridgeStartupSettings() {
        try {
            if (await fs.pathExists(this.hbServiceSettingsPath)) {
                const settings = await fs.readJson(this.hbServiceSettingsPath);
                return {
                    HOMEBRIDGE_DEBUG: settings.debugMode,
                    HOMEBRIDGE_KEEP_ORPHANS: settings.keepOrphans,
                    HOMEBRIDGE_INSECURE: typeof settings.insecureMode === 'boolean' ? settings.insecureMode : this.configService.homebridgeInsecureMode,
                    ENV_DEBUG: settings.env.DEBUG,
                    ENV_NODE_OPTIONS: settings.env.NODE_OPTIONS,
                };
            }
            else {
                return {
                    HOMEBRIDGE_INSECURE: this.configService.homebridgeInsecureMode,
                };
            }
        }
        catch (e) {
            return {};
        }
    }
    async setHomebridgeStartupSettings(data) {
        this.configService.hbServiceUiRestartRequired = true;
        const settings = {
            debugMode: data.HOMEBRIDGE_DEBUG,
            keepOrphans: data.HOMEBRIDGE_KEEP_ORPHANS,
            insecureMode: data.HOMEBRIDGE_INSECURE,
            env: {
                DEBUG: data.ENV_DEBUG ? data.ENV_DEBUG : undefined,
                NODE_OPTIONS: data.ENV_NODE_OPTIONS ? data.ENV_NODE_OPTIONS : undefined,
            },
        };
        return fs.writeJsonSync(this.hbServiceSettingsPath, settings, { spaces: 4 });
    }
    async setFullServiceRestartFlag() {
        this.configService.hbServiceUiRestartRequired = true;
        return { status: 0 };
    }
    async downloadLogFile(shouldRemoveColour) {
        if (!await fs.pathExists(this.configService.ui.log.path)) {
            this.logger.error(`Cannot download log file: "${this.configService.ui.log.path}" does not exist.`);
            throw new common_1.BadRequestException('Log file not found on disk.');
        }
        try {
            await fs.access(this.configService.ui.log.path, fs.constants.R_OK);
        }
        catch (e) {
            this.logger.error(`Cannot download log file: Missing read permissions on "${this.configService.ui.log.path}".`);
            throw new common_1.BadRequestException('Cannot read log file. Check the log file permissions');
        }
        if (shouldRemoveColour) {
            return fs.createReadStream(this.configService.ui.log.path, { encoding: 'utf8' });
        }
        const removeColour = new stream.Transform({
            transform(chunk, encoding, callback) {
                callback(null, chunk.toString('utf8').replace(/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]/g, ''));
            },
        });
        return fs.createReadStream(this.configService.ui.log.path, { encoding: 'utf8' })
            .pipe(removeColour);
    }
    async truncateLogFile(username) {
        if (!await fs.pathExists(this.configService.ui.log.path)) {
            this.logger.error(`Cannot truncate log file: "${this.configService.ui.log.path}" does not exist.`);
            throw new common_1.BadRequestException('Log file not found on disk.');
        }
        try {
            await fs.access(this.configService.ui.log.path, fs.constants.R_OK | fs.constants.W_OK);
        }
        catch (e) {
            this.logger.error(`Cannot truncate log file: Missing write permissions on "${this.configService.ui.log.path}".`);
            throw new common_1.BadRequestException('Cannot access file. Check the log file permissions');
        }
        await fs.truncate(this.configService.ui.log.path);
        setTimeout(() => {
            this.logger.warn(`Homebridge log truncated by ${username || 'user'}.`);
        }, 1000);
        return { status: 0 };
    }
};
HbServiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        logger_service_1.Logger])
], HbServiceService);
exports.HbServiceService = HbServiceService;
//# sourceMappingURL=hb-service.service.js.map