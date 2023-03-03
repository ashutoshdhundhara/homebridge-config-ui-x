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
exports.BackupService = void 0;
const os = require("os");
const tar = require("tar");
const path = require("path");
const util = require("util");
const fs = require("fs-extra");
const color = require("bash-color");
const unzipper = require("unzipper");
const child_process = require("child_process");
const dayjs = require("dayjs");
const stream_1 = require("stream");
const events_1 = require("events");
const common_1 = require("@nestjs/common");
const plugins_service_1 = require("../plugins/plugins.service");
const scheduler_service_1 = require("../../core/scheduler/scheduler.service");
const config_service_1 = require("../../core/config/config.service");
const homebridge_ipc_service_1 = require("../../core/homebridge-ipc/homebridge-ipc.service");
const logger_service_1 = require("../../core/logger/logger.service");
const pump = util.promisify(stream_1.pipeline);
let BackupService = class BackupService {
    constructor(configService, pluginsService, schedulerService, homebridgeIpcService, logger) {
        this.configService = configService;
        this.pluginsService = pluginsService;
        this.schedulerService = schedulerService;
        this.homebridgeIpcService = homebridgeIpcService;
        this.logger = logger;
        this.scheduleInstanceBackups();
    }
    scheduleInstanceBackups() {
        if (this.configService.ui.scheduledBackupDisable === true) {
            this.logger.debug('Scheduled backups disabled.');
            return;
        }
        const scheduleRule = new this.schedulerService.RecurrenceRule();
        scheduleRule.hour = Math.floor(Math.random() * 7);
        scheduleRule.minute = Math.floor(Math.random() * 59);
        scheduleRule.second = Math.floor(Math.random() * 59);
        this.schedulerService.scheduleJob('instance-backup', scheduleRule, () => {
            this.logger.log('Running scheduled instance backup...');
            this.runScheduledBackupJob();
        });
    }
    async createBackup() {
        const instanceId = this.configService.homebridgeConfig.bridge.username.replace(/:/g, '');
        const backupDir = await fs.mkdtemp(path.join(os.tmpdir(), 'homebridge-backup-'));
        const backupFileName = 'homebridge-backup' + '-' + instanceId + '.tar.gz';
        const backupPath = path.resolve(backupDir, backupFileName);
        this.logger.log(`Creating temporary backup archive at ${backupPath}`);
        try {
            const storagePath = await fs.realpath(this.configService.storagePath);
            await fs.copy(storagePath, path.resolve(backupDir, 'storage'), {
                filter: async (filePath) => {
                    if ([
                        'instance-backups',
                        'nssm.exe',
                        'homebridge.log',
                        'logs',
                        'node_modules',
                        'startup.sh',
                        '.docker.env',
                        'docker-compose.yml',
                        'pnpm-lock.yaml',
                        'package.json',
                        'package-lock.json',
                        '.npmrc',
                        'FFmpeg',
                        'fdk-aac',
                        '.git',
                        'recordings',
                        '.homebridge.sock',
                        '#recycle',
                        '@eaDir'
                    ].includes(path.basename(filePath))) {
                        return false;
                    }
                    try {
                        const stat = await fs.lstat(filePath);
                        return (stat.isDirectory() || stat.isFile());
                    }
                    catch (e) {
                        return false;
                    }
                },
            });
            const installedPlugins = await this.pluginsService.getInstalledPlugins();
            await fs.writeJSON(path.resolve(backupDir, 'plugins.json'), installedPlugins);
            await fs.writeJson(path.resolve(backupDir, 'info.json'), {
                timestamp: new Date().toISOString(),
                platform: os.platform(),
                uix: this.configService.package.version,
                node: process.version,
            });
            await tar.c({
                portable: true,
                gzip: true,
                file: backupPath,
                cwd: backupDir,
                filter: (filePath, stat) => {
                    if (stat.size > 1e+7) {
                        this.logger.warn(`Backup is skipping "${filePath}" because it is larger than 10MB.`);
                        return false;
                    }
                    return true;
                },
            }, [
                'storage', 'plugins.json', 'info.json',
            ]);
        }
        catch (e) {
            this.logger.log(`Backup failed, removing ${backupDir}`);
            await fs.remove(path.resolve(backupDir));
            throw e;
        }
        return {
            instanceId,
            backupDir,
            backupPath,
            backupFileName,
        };
    }
    async ensureScheduledBackupPath() {
        if (this.configService.ui.scheduledBackupPath) {
            if (!await fs.pathExists(this.configService.instanceBackupPath)) {
                throw new Error(`Custom instance backup path does not exists: ${this.configService.instanceBackupPath}`);
            }
            try {
                await fs.access(this.configService.instanceBackupPath, fs.constants.W_OK | fs.constants.R_OK);
            }
            catch (e) {
                throw new Error(`Custom instance backup path is not writable / readable by service: ${e.message}`);
            }
        }
        else {
            return await fs.ensureDir(this.configService.instanceBackupPath);
        }
    }
    async runScheduledBackupJob() {
        try {
            await this.ensureScheduledBackupPath();
        }
        catch (e) {
            this.logger.warn('Could not run scheduled backup:', e.message);
            return;
        }
        try {
            const { backupDir, backupPath, instanceId } = await this.createBackup();
            await fs.copy(backupPath, path.resolve(this.configService.instanceBackupPath, 'homebridge-backup-' + instanceId + '.' + new Date().getTime().toString() + '.tar.gz'));
            await fs.remove(path.resolve(backupDir));
        }
        catch (e) {
            this.logger.warn('Failed to create scheduled instance backup:', e.message);
        }
        try {
            const backups = await this.listScheduledBackups();
            for (const backup of backups) {
                if (dayjs().diff(dayjs(backup.timestamp), 'day') >= 7) {
                    await fs.remove(path.resolve(this.configService.instanceBackupPath, backup.fileName));
                }
            }
        }
        catch (e) {
            this.logger.warn('Failed to remove old backups:', e.message);
        }
    }
    async getNextBackupTime() {
        var _a;
        if (this.configService.ui.scheduledBackupDisable === true) {
            return {
                next: false
            };
        }
        else {
            return {
                next: ((_a = this.schedulerService.scheduledJobs['instance-backup']) === null || _a === void 0 ? void 0 : _a.nextInvocation()) || false,
            };
        }
    }
    async listScheduledBackups() {
        try {
            await this.ensureScheduledBackupPath();
        }
        catch (e) {
            this.logger.warn('Could get scheduled backups:', e.message);
            throw new common_1.InternalServerErrorException(e.message);
        }
        const dirContents = await fs.readdir(this.configService.instanceBackupPath, { withFileTypes: true });
        return dirContents
            .filter(x => x.isFile() && x.name.match(/^homebridge-backup-[0-9A-Za-z]{12}.[0-9]{09,15}.tar.gz/))
            .map(x => {
            const split = x.name.split('.');
            const instanceId = split[0].split('-')[2];
            if (split.length === 4 && !isNaN(split[1])) {
                return {
                    id: instanceId + '.' + split[1],
                    instanceId: split[0].split('-')[2],
                    timestamp: new Date(parseInt(split[1], 10)),
                    fileName: x.name,
                };
            }
            else {
                return null;
            }
        })
            .filter((x => x !== null))
            .sort((a, b) => {
            if (a.id > b.id) {
                return -1;
            }
            else if (a.id < b.id) {
                return -2;
            }
            else {
                return 0;
            }
        });
    }
    async getScheduledBackup(backupId) {
        const backupPath = path.resolve(this.configService.instanceBackupPath, 'homebridge-backup-' + backupId + '.tar.gz');
        if (!await fs.pathExists(backupPath)) {
            throw new common_1.NotFoundException();
        }
        return new common_1.StreamableFile(fs.createReadStream(backupPath));
    }
    async downloadBackup(reply) {
        const { backupDir, backupPath, backupFileName } = await this.createBackup();
        async function cleanup() {
            await fs.remove(path.resolve(backupDir));
            this.logger.log(`Backup complete, removing ${backupDir}`);
        }
        reply.raw.setHeader('Content-type', 'application/octet-stream');
        reply.raw.setHeader('Content-disposition', 'attachment; filename=' + backupFileName);
        reply.raw.setHeader('File-Name', backupFileName);
        if (reply.request.hostname === 'localhost:8080') {
            reply.raw.setHeader('access-control-allow-origin', 'http://localhost:4200');
        }
        return new common_1.StreamableFile(fs.createReadStream(backupPath).on('close', cleanup.bind(this)));
    }
    async uploadBackupRestore(data) {
        this.restoreDirectory = undefined;
        const backupDir = await fs.mkdtemp(path.join(os.tmpdir(), 'homebridge-backup-'));
        await pump(data.file, tar.x({
            cwd: backupDir,
        }));
        this.restoreDirectory = backupDir;
    }
    async removeRestoreDirectory() {
        if (this.restoreDirectory) {
            return await fs.remove(this.restoreDirectory);
        }
    }
    async triggerHeadlessRestore() {
        if (!await fs.pathExists(this.restoreDirectory)) {
            throw new common_1.BadRequestException('No backup file uploaded');
        }
        const client = new events_1.EventEmitter();
        client.on('stdout', (data) => {
            this.logger.log(data);
        });
        client.on('stderr', (data) => {
            this.logger.log(data);
        });
        await this.restoreFromBackup(client, true);
        return { status: 0 };
    }
    async restoreFromBackup(client, autoRestart = false) {
        if (!this.restoreDirectory) {
            throw new common_1.BadRequestException();
        }
        console.log(this.restoreDirectory);
        if (!await fs.pathExists(path.resolve(this.restoreDirectory, 'info.json'))) {
            await this.removeRestoreDirectory();
            throw new Error('Uploaded file is not a valid Homebridge Backup Archive.');
        }
        if (!await fs.pathExists(path.resolve(this.restoreDirectory, 'plugins.json'))) {
            await this.removeRestoreDirectory();
            throw new Error('Uploaded file is not a valid Homebridge Backup Archive.');
        }
        if (!await fs.pathExists(path.resolve(this.restoreDirectory, 'storage'))) {
            await this.removeRestoreDirectory();
            throw new Error('Uploaded file is not a valid Homebridge Backup Archive.');
        }
        const backupInfo = await fs.readJson(path.resolve(this.restoreDirectory, 'info.json'));
        client.emit('stdout', color.cyan('Backup Archive Information\r\n'));
        client.emit('stdout', `Source Node.js Version: ${backupInfo.node}\r\n`);
        client.emit('stdout', `Source Homebridge Config UI X Version: v${backupInfo.uix}\r\n`);
        client.emit('stdout', `Source Platform: ${backupInfo.platform}\r\n`);
        client.emit('stdout', `Created: ${backupInfo.timestamp}\r\n`);
        this.logger.warn('Starting backup restore...');
        client.emit('stdout', color.cyan('\r\nRestoring backup...\r\n\r\n'));
        await new Promise(resolve => setTimeout(resolve, 1000));
        const restoreFilter = [
            path.join(this.restoreDirectory, 'storage', 'package.json'),
            path.join(this.restoreDirectory, 'storage', 'package-lock.json'),
            path.join(this.restoreDirectory, 'storage', '.npmrc'),
            path.join(this.restoreDirectory, 'storage', 'docker-compose.yml'),
        ];
        const storagePath = await fs.realpath(this.configService.storagePath);
        client.emit('stdout', color.yellow(`Restoring Homebridge storage to ${storagePath}\r\n`));
        await new Promise(resolve => setTimeout(resolve, 100));
        await fs.copy(path.resolve(this.restoreDirectory, 'storage'), storagePath, {
            filter: async (filePath) => {
                if (restoreFilter.includes(filePath)) {
                    client.emit('stdout', `Skipping ${path.basename(filePath)}\r\n`);
                    return false;
                }
                try {
                    const stat = await fs.lstat(filePath);
                    if (stat.isDirectory() || stat.isFile()) {
                        client.emit('stdout', `Restoring ${path.basename(filePath)}\r\n`);
                        return true;
                    }
                    else {
                        client.emit('stdout', `Skipping ${path.basename(filePath)}\r\n`);
                        return false;
                    }
                }
                catch (e) {
                    client.emit('stdout', `Skipping ${path.basename(filePath)}\r\n`);
                    return false;
                }
            },
        });
        client.emit('stdout', color.yellow('File restore complete.\r\n'));
        await new Promise(resolve => setTimeout(resolve, 1000));
        client.emit('stdout', color.cyan('\r\nRestoring plugins...\r\n'));
        const plugins = (await fs.readJson(path.resolve(this.restoreDirectory, 'plugins.json')))
            .filter((x) => ![
            'homebridge-config-ui-x',
        ].includes(x.name) && x.publicPackage);
        for (const plugin of plugins) {
            try {
                client.emit('stdout', color.yellow(`\r\nInstalling ${plugin.name}...\r\n`));
                await this.pluginsService.managePlugin('install', { name: plugin.name, version: plugin.installedVersion }, client);
            }
            catch (e) {
                client.emit('stdout', color.red(`Failed to install ${plugin.name}.\r\n`));
            }
        }
        const restoredConfig = await fs.readJson(this.configService.configPath);
        if (restoredConfig.bridge) {
            restoredConfig.bridge.port = this.configService.homebridgeConfig.bridge.port;
        }
        if (restoredConfig.bridge.bind) {
            this.checkBridgeBindConfig(restoredConfig);
        }
        if (!Array.isArray(restoredConfig.platforms)) {
            restoredConfig.platforms = [];
        }
        const uiConfigBlock = restoredConfig.platforms.find((x) => x.platform === 'config');
        if (uiConfigBlock) {
            uiConfigBlock.port = this.configService.ui.port;
            if (this.configService.serviceMode || this.configService.runningInDocker) {
                delete uiConfigBlock.restart;
                delete uiConfigBlock.sudo;
                delete uiConfigBlock.log;
            }
        }
        else {
            restoredConfig.platforms.push({
                name: 'Config',
                port: this.configService.ui.port,
                platform: 'config',
            });
        }
        await fs.writeJson(this.configService.configPath, restoredConfig, { spaces: 4 });
        await this.removeRestoreDirectory();
        client.emit('stdout', color.green('\r\nRestore Complete!\r\n'));
        this.configService.hbServiceUiRestartRequired = true;
        if (autoRestart) {
            this.postBackupRestoreRestart();
        }
        return { status: 0 };
    }
    async uploadHbfxRestore(data) {
        this.restoreDirectory = undefined;
        const backupDir = await fs.mkdtemp(path.join(os.tmpdir(), 'homebridge-backup-'));
        this.logger.log(`Extracting .hbfx file to ${backupDir}`);
        await pump(data.file, unzipper.Extract({
            path: backupDir,
        }));
        this.restoreDirectory = backupDir;
    }
    async restoreHbfxBackup(client) {
        var _a, _b, _c;
        if (!this.restoreDirectory) {
            throw new common_1.BadRequestException();
        }
        if (!await fs.pathExists(path.resolve(this.restoreDirectory, 'package.json'))) {
            await this.removeRestoreDirectory();
            throw new Error('Uploaded file is not a valid HBFX Backup Archive.');
        }
        if (!await fs.pathExists(path.resolve(this.restoreDirectory, 'etc', 'config.json'))) {
            await this.removeRestoreDirectory();
            throw new Error('Uploaded file is not a valid HBFX Backup Archive.');
        }
        const backupInfo = await fs.readJson(path.resolve(this.restoreDirectory, 'package.json'));
        client.emit('stdout', color.cyan('Backup Archive Information\r\n'));
        client.emit('stdout', `Backup Source: ${backupInfo.name}\r\n`);
        client.emit('stdout', `Version: v${backupInfo.version}\r\n`);
        this.logger.warn('Starting hbfx restore...');
        client.emit('stdout', color.cyan('\r\nRestoring hbfx backup...\r\n\r\n'));
        await new Promise(resolve => setTimeout(resolve, 1000));
        const storagePath = await fs.realpath(this.configService.storagePath);
        client.emit('stdout', color.yellow(`Restoring Homebridge storage to ${storagePath}\r\n`));
        await fs.copy(path.resolve(this.restoreDirectory, 'etc'), path.resolve(storagePath), {
            filter: (filePath) => {
                if ([
                    'access.json',
                    'dashboard.json',
                    'layout.json',
                    'config.json',
                ].includes(path.basename(filePath))) {
                    return false;
                }
                client.emit('stdout', `Restoring ${path.basename(filePath)}\r\n`);
                return true;
            },
        });
        const sourceAccessoriesPath = path.resolve(this.restoreDirectory, 'etc', 'accessories');
        const targetAccessoriestPath = path.resolve(storagePath, 'accessories');
        if (await fs.pathExists(sourceAccessoriesPath)) {
            await fs.copy(sourceAccessoriesPath, targetAccessoriestPath, {
                filter: (filePath) => {
                    client.emit('stdout', `Restoring ${path.basename(filePath)}\r\n`);
                    return true;
                },
            });
        }
        const sourceConfig = await fs.readJson(path.resolve(this.restoreDirectory, 'etc', 'config.json'));
        const pluginMap = {
            'hue': 'homebridge-hue',
            'chamberlain': 'homebridge-chamberlain',
            'google-home': 'homebridge-gsh',
            'ikea-tradfri': 'homebridge-ikea-tradfri-gateway',
            'nest': 'homebridge-nest',
            'ring': 'homebridge-ring',
            'roborock': 'homebridge-roborock',
            'shelly': 'homebridge-shelly',
            'wink': 'homebridge-wink3',
            'homebridge-tuya-web': '@milo526/homebridge-tuya-web',
        };
        if ((_a = sourceConfig.plugins) === null || _a === void 0 ? void 0 : _a.length) {
            for (let plugin of sourceConfig.plugins) {
                if (plugin in pluginMap) {
                    plugin = pluginMap[plugin];
                }
                try {
                    client.emit('stdout', color.yellow(`\r\nInstalling ${plugin}...\r\n`));
                    await this.pluginsService.managePlugin('install', { name: plugin, version: 'latest' }, client);
                }
                catch (e) {
                    client.emit('stdout', color.red(`Failed to install ${plugin}.\r\n`));
                }
            }
        }
        const targetConfig = JSON.parse(JSON.stringify({
            bridge: sourceConfig.bridge,
            accessories: ((_b = sourceConfig.accessories) === null || _b === void 0 ? void 0 : _b.map((x) => {
                delete x.plugin_map;
                return x;
            })) || [],
            platforms: ((_c = sourceConfig.platforms) === null || _c === void 0 ? void 0 : _c.map((x) => {
                if (x.platform === 'google-home') {
                    x.platform = 'google-smarthome';
                    x.notice = 'Keep your token a secret!';
                }
                delete x.plugin_map;
                return x;
            })) || [],
        }));
        targetConfig.bridge.name = 'Homebridge ' + targetConfig.bridge.username.substr(targetConfig.bridge.username.length - 5).replace(/:/g, '');
        if (targetConfig.bridge.bind) {
            this.checkBridgeBindConfig(targetConfig);
        }
        targetConfig.platforms.push(this.configService.ui);
        await fs.writeJson(this.configService.configPath, targetConfig, { spaces: 4 });
        await this.removeRestoreDirectory();
        client.emit('stdout', color.green('\r\nRestore Complete!\r\n'));
        this.configService.hbServiceUiRestartRequired = true;
        return { status: 0 };
    }
    postBackupRestoreRestart() {
        setTimeout(() => {
            if (this.configService.serviceMode) {
                this.homebridgeIpcService.killHomebridge();
                setTimeout(() => {
                    process.kill(process.pid, 'SIGKILL');
                }, 500);
                return;
            }
            if (this.configService.runningInDocker) {
                try {
                    return child_process.execSync('killall -9 homebridge; kill -9 $(pidof homebridge-config-ui-x);');
                }
                catch (e) {
                    this.logger.error(e);
                    this.logger.error('Failed to restart Homebridge');
                }
            }
            if (process.connected) {
                process.kill(process.ppid, 'SIGKILL');
                process.kill(process.pid, 'SIGKILL');
            }
            if (this.configService.ui.noFork) {
                return process.kill(process.pid, 'SIGKILL');
            }
            if (os.platform() === 'linux' && this.configService.ui.standalone) {
                try {
                    const getPidByPort = (port) => {
                        try {
                            return parseInt(child_process.execSync(`fuser ${port}/tcp 2>/dev/null`).toString('utf8').trim(), 10);
                        }
                        catch (e) {
                            return null;
                        }
                    };
                    const getPidByName = () => {
                        try {
                            return parseInt(child_process.execSync('pidof homebridge').toString('utf8').trim(), 10);
                        }
                        catch (e) {
                            return null;
                        }
                    };
                    const homebridgePid = getPidByPort(this.configService.homebridgeConfig.bridge.port) || getPidByName();
                    if (homebridgePid) {
                        process.kill(homebridgePid, 'SIGKILL');
                        return process.kill(process.pid, 'SIGKILL');
                    }
                }
                catch (e) {
                }
            }
            if (this.configService.ui.restart) {
                return child_process.exec(this.configService.ui.restart, (err) => {
                    if (err) {
                        this.logger.log('Restart command exited with an error. Failed to restart Homebridge.');
                    }
                });
            }
            return process.kill(process.pid, 'SIGKILL');
        }, 500);
        return { status: 0 };
    }
    checkBridgeBindConfig(restoredConfig) {
        if (restoredConfig.bridge.bind) {
            if (typeof restoredConfig.bridge.bind === 'string') {
                restoredConfig.bridge.bind = [restoredConfig.bridge.bind];
            }
            if (!Array.isArray(restoredConfig.bridge.bind)) {
                delete restoredConfig.bridge.bind;
                return;
            }
            const networkInterfaces = os.networkInterfaces();
            restoredConfig.bridge.bind = restoredConfig.bridge.bind.filter((x) => networkInterfaces[x]);
            if (!restoredConfig.bridge.bind) {
                delete restoredConfig.bridge.bind;
            }
        }
    }
};
BackupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        plugins_service_1.PluginsService,
        scheduler_service_1.SchedulerService,
        homebridge_ipc_service_1.HomebridgeIpcService,
        logger_service_1.Logger])
], BackupService);
exports.BackupService = BackupService;
//# sourceMappingURL=backup.service.js.map