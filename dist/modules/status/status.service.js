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
exports.StatusService = void 0;
const os = require("os");
const path = require("path");
const child_process = require("child_process");
const util = require("util");
const fs = require("fs-extra");
const si = require("systeminformation");
const semver = require("semver");
const NodeCache = require("node-cache");
const rxjs_1 = require("rxjs");
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const logger_service_1 = require("../../core/logger/logger.service");
const config_service_1 = require("../../core/config/config.service");
const homebridge_ipc_service_1 = require("../../core/homebridge-ipc/homebridge-ipc.service");
const plugins_service_1 = require("../plugins/plugins.service");
const server_service_1 = require("../server/server.service");
const execAsync = util.promisify(child_process.exec);
let StatusService = class StatusService {
    constructor(httpService, logger, configService, pluginsService, serverService, homebridgeIpcService) {
        this.httpService = httpService;
        this.logger = logger;
        this.configService = configService;
        this.pluginsService = pluginsService;
        this.serverService = serverService;
        this.homebridgeIpcService = homebridgeIpcService;
        this.statusCache = new NodeCache({ stdTTL: 3600 });
        this.homebridgeStatus = "down";
        this.homebridgeStatusChange = new rxjs_1.Subject();
        this.cpuLoadHistory = [];
        this.memoryUsageHistory = [];
        this.rpiGetThrottledMapping = {
            0: 'Under-voltage detected',
            1: 'Arm frequency capped',
            2: 'Currently throttled',
            3: 'Soft temperature limit active',
            16: 'Under-voltage has occurred',
            17: 'Arm frequency capping has occurred',
            18: 'Throttled has occurred',
            19: 'Soft temperature limit has occurred',
        };
        if (os.platform() === 'freebsd') {
            this.getCpuLoadPoint = this.getCpuLoadPointAlt;
            this.getCpuTemp = this.getCpuTempAlt;
        }
        if (this.configService.ui.disableServerMetricsMonitoring !== true) {
            setInterval(async () => {
                this.getCpuLoadPoint();
                this.getMemoryUsagePoint();
            }, 10000);
        }
        else {
            this.logger.warn('Server metrics monitoring disabled.');
        }
        if (this.configService.serviceMode) {
            this.homebridgeIpcService.on('serverStatusUpdate', (data) => {
                this.homebridgeStatus = data.status === "ok" ? "up" : data.status;
                if (data === null || data === void 0 ? void 0 : data.setupUri) {
                    this.serverService.setupCode = data.setupUri;
                }
                this.homebridgeStatusChange.next(this.homebridgeStatus);
            });
        }
    }
    async getCpuLoadPoint() {
        const currentLoad = (await si.currentLoad()).currentLoad;
        this.cpuLoadHistory = this.cpuLoadHistory.slice(-60);
        this.cpuLoadHistory.push(currentLoad);
    }
    async getMemoryUsagePoint() {
        const mem = await si.mem();
        this.memoryInfo = mem;
        const memoryFreePercent = ((mem.total - mem.available) / mem.total) * 100;
        this.memoryUsageHistory = this.memoryUsageHistory.slice(-60);
        this.memoryUsageHistory.push(memoryFreePercent);
    }
    async getCpuLoadPointAlt() {
        const currentLoad = (os.loadavg()[0] * 100 / os.cpus().length);
        this.cpuLoadHistory = this.cpuLoadHistory.slice(-60);
        this.cpuLoadHistory.push(currentLoad);
    }
    async getCpuTemp() {
        const cpuTempData = await si.cpuTemperature();
        if (cpuTempData.main === -1 && this.configService.ui.temp) {
            return this.getCpuTempLegacy();
        }
        return cpuTempData;
    }
    async getCpuTempLegacy() {
        try {
            const tempData = await fs.readFile(this.configService.ui.temp, 'utf-8');
            const cpuTemp = parseInt(tempData, 10) / 1000;
            return {
                main: cpuTemp,
                cores: [],
                max: cpuTemp,
            };
        }
        catch (e) {
            this.logger.error(`Failed to read temp from ${this.configService.ui.temp} - ${e.message}`);
            return this.getCpuTempAlt();
        }
    }
    async getCpuTempAlt() {
        return {
            main: -1,
            cores: [],
            max: -1,
        };
    }
    async getCurrentNetworkUsage() {
        const defaultInterfaceName = await si.networkInterfaceDefault();
        const net = await si.networkStats(defaultInterfaceName);
        const tx_rx_sec = (net[0].tx_sec + net[0].rx_sec) / 1024 / 1024;
        return { net: net[0], point: tx_rx_sec };
    }
    async getDashboardLayout() {
        if (!this.dashboardLayout) {
            try {
                const layout = await fs.readJSON(path.resolve(this.configService.storagePath, '.uix-dashboard.json'));
                this.dashboardLayout = layout;
                return layout;
            }
            catch (e) {
                return [];
            }
        }
        else {
            return this.dashboardLayout;
        }
    }
    async setDashboardLayout(layout) {
        fs.writeJSONSync(path.resolve(this.configService.storagePath, '.uix-dashboard.json'), layout);
        this.dashboardLayout = layout;
        return { status: 'ok' };
    }
    async getServerCpuInfo() {
        if (!this.memoryUsageHistory.length) {
            await this.getCpuLoadPoint();
        }
        return {
            cpuTemperature: await this.getCpuTemp(),
            currentLoad: this.cpuLoadHistory.slice(-1)[0],
            cpuLoadHistory: this.cpuLoadHistory,
        };
    }
    async getServerMemoryInfo() {
        if (!this.memoryUsageHistory.length) {
            await this.getMemoryUsagePoint();
        }
        return {
            mem: this.memoryInfo,
            memoryUsageHistory: this.memoryUsageHistory,
        };
    }
    async getServerUptimeInfo() {
        return {
            time: await si.time(),
            processUptime: process.uptime(),
        };
    }
    async getHomebridgePairingPin() {
        return {
            pin: this.configService.homebridgeConfig.bridge.pin,
            setupUri: await this.serverService.getSetupCode(),
        };
    }
    async getHomebridgeStatus() {
        return {
            status: this.homebridgeStatus,
            consolePort: this.configService.ui.port,
            port: this.configService.homebridgeConfig.bridge.port,
            pin: this.configService.homebridgeConfig.bridge.pin,
            setupUri: this.serverService.setupCode,
            packageVersion: this.configService.package.version,
        };
    }
    async watchStats(client) {
        let homebridgeStatusChangeSub;
        let homebridgeStatusInterval;
        client.emit('homebridge-status', await this.getHomebridgeStats());
        if (this.configService.serviceMode && this.configService.homebridgeVersion && semver.gt(this.configService.homebridgeVersion, '1.3.3-beta.5', { includePrerelease: true })) {
            homebridgeStatusChangeSub = this.homebridgeStatusChange.subscribe(async (status) => {
                client.emit('homebridge-status', await this.getHomebridgeStats());
            });
        }
        else {
            homebridgeStatusInterval = setInterval(async () => {
                client.emit('homebridge-status', await this.getHomebridgeStats());
            }, 10000);
        }
        const onEnd = () => {
            client.removeAllListeners('end');
            client.removeAllListeners('disconnect');
            if (homebridgeStatusInterval) {
                clearInterval(homebridgeStatusInterval);
            }
            if (homebridgeStatusChangeSub) {
                homebridgeStatusChangeSub.unsubscribe();
            }
        };
        client.on('end', onEnd.bind(this));
        client.on('disconnect', onEnd.bind(this));
    }
    async getHomebridgeStats() {
        return {
            consolePort: this.configService.ui.port,
            port: this.configService.homebridgeConfig.bridge.port,
            pin: this.configService.homebridgeConfig.bridge.pin,
            setupUri: await this.serverService.getSetupCode(),
            packageVersion: this.configService.package.version,
            status: await this.checkHomebridgeStatus(),
        };
    }
    async checkHomebridgeStatus() {
        if (this.configService.serviceMode && this.configService.homebridgeVersion && semver.gt(this.configService.homebridgeVersion, '1.3.3-beta.5', { includePrerelease: true })) {
            return this.homebridgeStatus;
        }
        try {
            await this.httpService.get(`http://localhost:${this.configService.homebridgeConfig.bridge.port}`, {
                validateStatus: () => true,
            }).toPromise();
            this.homebridgeStatus = "up";
        }
        catch (e) {
            this.homebridgeStatus = "down";
        }
        return this.homebridgeStatus;
    }
    async getDefaultInterface() {
        const cachedResult = this.statusCache.get('defaultInterface');
        if (cachedResult) {
            return cachedResult;
        }
        const defaultInterfaceName = await si.networkInterfaceDefault();
        const defaultInterface = defaultInterfaceName ? (await si.networkInterfaces()).find(x => x.iface === defaultInterfaceName) : undefined;
        if (defaultInterface) {
            this.statusCache.set('defaultInterface', defaultInterface);
        }
        return defaultInterface;
    }
    async getOsInfo() {
        const cachedResult = this.statusCache.get('osInfo');
        if (cachedResult) {
            return cachedResult;
        }
        const osInfo = await si.osInfo();
        this.statusCache.set('osInfo', osInfo, 86400);
        return osInfo;
    }
    async getHomebridgeServerInfo() {
        return {
            serviceUser: os.userInfo().username,
            homebridgeConfigJsonPath: this.configService.configPath,
            homebridgeStoragePath: this.configService.storagePath,
            homebridgeInsecureMode: this.configService.homebridgeInsecureMode,
            homebridgeCustomPluginPath: this.configService.customPluginPath,
            homebridgeRunningInDocker: this.configService.runningInDocker,
            homebridgeRunningInSynologyPackage: this.configService.runningInSynologyPackage,
            homebridgeRunningInPackageMode: this.configService.runningInPackageMode,
            homebridgeServiceMode: this.configService.serviceMode,
            nodeVersion: process.version,
            os: await this.getOsInfo(),
            time: await si.time(),
            network: await this.getDefaultInterface() || {},
        };
    }
    async getHomebridgeVersion() {
        return this.pluginsService.getHomebridgePackage();
    }
    async getNodeJsVersionInfo() {
        const cachedResult = this.statusCache.get('nodeJsVersion');
        if (cachedResult) {
            return cachedResult;
        }
        try {
            const versionList = (await this.httpService.get('https://nodejs.org/dist/index.json').toPromise()).data;
            const currentLts = versionList.filter(x => x.lts)[0];
            const versionInformation = {
                currentVersion: process.version,
                latestVersion: currentLts.version,
                updateAvailable: semver.gt(currentLts.version, process.version),
                showUpdateWarning: semver.lt(process.version, '14.15.0'),
                installPath: path.dirname(process.execPath),
            };
            this.statusCache.set('nodeJsVersion', versionInformation, 86400);
            return versionInformation;
        }
        catch (e) {
            this.logger.log('Failed to check for Node.js version updates - check your internet connection.');
            const versionInformation = {
                currentVersion: process.version,
                latestVersion: process.version,
                updateAvailable: false,
                showUpdateWarning: false,
            };
            this.statusCache.set('nodeJsVersion', versionInformation, 3600);
            return versionInformation;
        }
    }
    async getRaspberryPiThrottledStatus() {
        if (!this.configService.runningOnRaspberryPi) {
            throw new common_1.BadRequestException('This command is only available on Raspberry Pi');
        }
        const output = {};
        for (const bit of Object.keys(this.rpiGetThrottledMapping)) {
            output[this.rpiGetThrottledMapping[bit]] = false;
        }
        try {
            const { stdout } = await execAsync('vcgencmd get_throttled');
            const throttledHex = parseInt(stdout.trim().replace('throttled=', ''));
            if (!isNaN(throttledHex)) {
                for (const bit of Object.keys(this.rpiGetThrottledMapping)) {
                    if ((throttledHex >> parseInt(bit, 10)) & 1) {
                        output[this.rpiGetThrottledMapping[bit]] = true;
                    }
                    else {
                        output[this.rpiGetThrottledMapping[bit]] = false;
                    }
                }
            }
        }
        catch (e) {
            this.logger.debug('Could not check vcgencmd get_throttled:', e.message);
        }
        return output;
    }
};
StatusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        logger_service_1.Logger,
        config_service_1.ConfigService,
        plugins_service_1.PluginsService,
        server_service_1.ServerService,
        homebridge_ipc_service_1.HomebridgeIpcService])
], StatusService);
exports.StatusService = StatusService;
//# sourceMappingURL=status.service.js.map