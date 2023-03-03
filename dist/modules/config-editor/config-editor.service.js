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
exports.ConfigEditorService = void 0;
const fs = require("fs-extra");
const path = require("path");
const dayjs = require("dayjs");
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../../core/logger/logger.service");
const config_service_1 = require("../../core/config/config.service");
const scheduler_service_1 = require("../../core/scheduler/scheduler.service");
const plugins_service_1 = require("../plugins/plugins.service");
let ConfigEditorService = class ConfigEditorService {
    constructor(logger, configService, schedulerService, pluginsService) {
        this.logger = logger;
        this.configService = configService;
        this.schedulerService = schedulerService;
        this.pluginsService = pluginsService;
        this.start();
        this.scheduleConfigBackupCleanup();
    }
    async start() {
        await this.ensureBackupPathExists();
        await this.migrateConfigBackups();
    }
    scheduleConfigBackupCleanup() {
        const scheduleRule = new this.schedulerService.RecurrenceRule();
        scheduleRule.hour = 1;
        scheduleRule.minute = 10;
        scheduleRule.second = Math.floor(Math.random() * 59) + 1;
        this.logger.debug('Next config.json backup cleanup scheduled for:', scheduleRule.nextInvocationDate(new Date()).toString());
        this.schedulerService.scheduleJob('cleanup-config-backups', scheduleRule, () => {
            this.logger.log('Running job to cleanup config.json backup files older than 60 days...');
            this.cleanupConfigBackups();
        });
    }
    async getConfigFile() {
        const config = await fs.readJson(this.configService.configPath);
        if (!config.bridge || typeof config.bridge !== 'object') {
            config.bridge = {};
        }
        if (!config.accessories || !Array.isArray(config.accessories)) {
            config.accessories = [];
        }
        if (!config.platforms || !Array.isArray(config.platforms)) {
            config.platforms = [];
        }
        return config;
    }
    async updateConfigFile(config) {
        const now = new Date();
        if (!config) {
            config = {};
        }
        if (!config.bridge) {
            config.bridge = {};
        }
        if (typeof config.bridge.port === 'string') {
            config.bridge.port = parseInt(config.bridge.port, 10);
        }
        if (!config.bridge.port || typeof config.bridge.port !== 'number' || config.bridge.port > 65533 || config.bridge.port < 1025) {
            config.bridge.port = Math.floor(Math.random() * (52000 - 51000 + 1) + 51000);
        }
        if (!config.bridge.username) {
            config.bridge.username = this.generateUsername();
        }
        const usernamePattern = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/;
        if (!usernamePattern.test(config.bridge.username)) {
            if (usernamePattern.test(this.configService.homebridgeConfig.bridge.username)) {
                config.bridge.username = this.configService.homebridgeConfig.bridge.username;
            }
            else {
                config.bridge.username = this.generateUsername();
            }
        }
        if (!config.bridge.pin) {
            config.bridge.pin = this.generatePin();
        }
        const pinPattern = /^([0-9]{3}-[0-9]{2}-[0-9]{3})$/;
        if (!pinPattern.test(config.bridge.pin)) {
            if (pinPattern.test(this.configService.homebridgeConfig.bridge.pin)) {
                config.bridge.pin = this.configService.homebridgeConfig.bridge.pin;
            }
            else {
                config.bridge.pin = this.generatePin();
            }
        }
        if (!config.bridge.name || typeof config.bridge.name !== 'string') {
            config.bridge.name = 'Homebridge ' + config.bridge.username.substr(config.bridge.username.length - 5).replace(/:/g, '');
        }
        if (!config.accessories || !Array.isArray(config.accessories)) {
            config.accessories = [];
        }
        if (!config.platforms || !Array.isArray(config.platforms)) {
            config.platforms = [];
        }
        if (config.plugins && Array.isArray(config.plugins)) {
            if (!config.plugins.length) {
                delete config.plugins;
            }
        }
        else if (config.plugins) {
            delete config.plugins;
        }
        if (config.mdns && typeof config.mdns !== 'object') {
            delete config.mdns;
        }
        if (config.disabledPlugins && !Array.isArray(config.disabledPlugins)) {
            delete config.disabledPlugins;
        }
        try {
            await fs.rename(this.configService.configPath, path.resolve(this.configService.configBackupPath, 'config.json.' + now.getTime().toString()));
        }
        catch (e) {
            if (e.code === 'ENOENT') {
                this.ensureBackupPathExists();
            }
            else {
                this.logger.warn('Could not create a backup of the config.json file to', this.configService.configBackupPath, e.message);
            }
        }
        fs.writeJsonSync(this.configService.configPath, config, { spaces: 4 });
        this.logger.log('Changes to config.json saved.');
        const configCopy = JSON.parse(JSON.stringify(config));
        this.configService.parseConfig(configCopy);
        return config;
    }
    async getConfigForPlugin(pluginName) {
        return Promise.all([
            await this.pluginsService.getPluginAlias(pluginName),
            await this.getConfigFile(),
        ]).then(([plugin, config]) => {
            if (!plugin.pluginAlias) {
                return new common_1.BadRequestException('Plugin alias could not be determined.');
            }
            const arrayKey = plugin.pluginType === 'accessory' ? 'accessories' : 'platforms';
            return config[arrayKey].filter((block) => {
                return block[plugin.pluginType] === plugin.pluginAlias ||
                    block[plugin.pluginType] === pluginName + '.' + plugin.pluginAlias;
            });
        });
    }
    async updateConfigForPlugin(pluginName, pluginConfig) {
        return Promise.all([
            await this.pluginsService.getPluginAlias(pluginName),
            await this.getConfigFile(),
        ]).then(async ([plugin, config]) => {
            if (!plugin.pluginAlias) {
                return new common_1.BadRequestException('Plugin alias could not be determined.');
            }
            const arrayKey = plugin.pluginType === 'accessory' ? 'accessories' : 'platforms';
            if (!Array.isArray(pluginConfig)) {
                throw new common_1.BadRequestException('Plugin Config must be an array.');
            }
            for (const block of pluginConfig) {
                if (typeof block !== 'object' || Array.isArray(block)) {
                    throw new common_1.BadRequestException('Plugin config must be an array of objects.');
                }
                block[plugin.pluginType] = plugin.pluginAlias;
            }
            let positionIndices;
            config[arrayKey] = config[arrayKey].filter((block, index) => {
                if (block[plugin.pluginType] === plugin.pluginAlias || block[plugin.pluginType] === pluginName + '.' + plugin.pluginAlias) {
                    positionIndices = index;
                    return false;
                }
                else {
                    return true;
                }
            });
            if (positionIndices !== undefined) {
                config[arrayKey].splice(positionIndices, 0, ...pluginConfig);
            }
            else {
                config[arrayKey].push(...pluginConfig);
            }
            await this.updateConfigFile(config);
            return pluginConfig;
        });
    }
    async disablePlugin(pluginName) {
        if (pluginName === this.configService.name) {
            throw new common_1.BadRequestException('Disabling this plugin is now allowed.');
        }
        const config = await this.getConfigFile();
        if (!Array.isArray(config.disabledPlugins)) {
            config.disabledPlugins = [];
        }
        config.disabledPlugins.push(pluginName);
        await this.updateConfigFile(config);
        return config.disabledPlugins;
    }
    async enablePlugin(pluginName) {
        const config = await this.getConfigFile();
        if (!Array.isArray(config.disabledPlugins)) {
            config.disabledPlugins = [];
        }
        const idx = config.disabledPlugins.findIndex(x => x === pluginName);
        config.disabledPlugins.splice(idx, 1);
        await this.updateConfigFile(config);
        return config.disabledPlugins;
    }
    async listConfigBackups() {
        const dirContents = await fs.readdir(this.configService.configBackupPath);
        const backups = dirContents
            .filter(x => x.match(/^config.json.[0-9]{09,15}/))
            .sort()
            .reverse()
            .map(x => {
            const ext = x.split('.');
            if (ext.length === 3 && !isNaN(ext[2])) {
                return {
                    id: ext[2],
                    timestamp: new Date(parseInt(ext[2], 10)),
                    file: x,
                };
            }
            else {
                return null;
            }
        })
            .filter((x => x && !isNaN(x.timestamp.getTime())));
        return backups;
    }
    async getConfigBackup(backupId) {
        const requestedBackupPath = path.resolve(this.configService.configBackupPath, 'config.json.' + backupId);
        if (!await fs.pathExists(requestedBackupPath)) {
            throw new common_1.NotFoundException(`Backup ${backupId} Not Found`);
        }
        return await fs.readFile(requestedBackupPath);
    }
    async deleteAllConfigBackups() {
        const backups = await this.listConfigBackups();
        await backups.forEach(async (backupFile) => {
            await fs.unlink(path.resolve(this.configService.configBackupPath, backupFile.file));
        });
    }
    async ensureBackupPathExists() {
        try {
            await fs.ensureDir(this.configService.configBackupPath);
        }
        catch (e) {
            this.logger.error('Could not create directory for config backups:', this.configService.configBackupPath, e.message);
            this.logger.error('Config backups will continue to use', this.configService.storagePath);
            this.configService.configBackupPath = this.configService.storagePath;
        }
    }
    async cleanupConfigBackups() {
        try {
            const backups = await this.listConfigBackups();
            for (const backup of backups) {
                if (dayjs().diff(dayjs(backup.timestamp), 'day') >= 60) {
                    await fs.remove(path.resolve(this.configService.configBackupPath, backup.file));
                }
            }
        }
        catch (e) {
            this.logger.warn('Failed to cleanup old config.json backup files:', e.message);
        }
    }
    async migrateConfigBackups() {
        try {
            if (this.configService.configBackupPath === this.configService.storagePath) {
                this.logger.error('Skipping migration of existing config.json backups...');
                return;
            }
            const dirContents = await fs.readdir(this.configService.storagePath);
            const backups = dirContents
                .filter(x => x.match(/^config.json.[0-9]{09,15}/))
                .sort()
                .reverse();
            for (const backupFileName of backups.splice(0, 100)) {
                const sourcePath = path.resolve(this.configService.storagePath, backupFileName);
                const targetPath = path.resolve(this.configService.configBackupPath, backupFileName);
                await fs.move(sourcePath, targetPath, { overwrite: true });
            }
            for (const backupFileName of backups) {
                const sourcePath = path.resolve(this.configService.storagePath, backupFileName);
                await fs.remove(sourcePath);
            }
        }
        catch (e) {
            this.logger.warn('An error occured while migrating config.json backups to new location', e.message);
        }
    }
    generatePin() {
        let code = Math.floor(10000000 + Math.random() * 90000000) + '';
        code = code.split('');
        code.splice(3, 0, '-');
        code.splice(6, 0, '-');
        code = code.join('');
        return code;
    }
    generateUsername() {
        const hexDigits = '0123456789ABCDEF';
        let username = '0E:';
        for (let i = 0; i < 5; i++) {
            username += hexDigits.charAt(Math.round(Math.random() * 15));
            username += hexDigits.charAt(Math.round(Math.random() * 15));
            if (i !== 4) {
                username += ':';
            }
        }
        return username;
    }
};
ConfigEditorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.Logger,
        config_service_1.ConfigService,
        scheduler_service_1.SchedulerService,
        plugins_service_1.PluginsService])
], ConfigEditorService);
exports.ConfigEditorService = ConfigEditorService;
//# sourceMappingURL=config-editor.service.js.map