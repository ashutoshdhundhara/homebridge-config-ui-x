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
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const os = require("os");
const path = require("path");
const fs = require("fs-extra");
const crypto = require("crypto");
const semver = require("semver");
const _ = require("lodash");
let ConfigService = class ConfigService {
    constructor() {
        this.name = 'homebridge-config-ui-x';
        this.configPath = process.env.UIX_CONFIG_PATH || path.resolve(os.homedir(), '.homebridge/config.json');
        this.storagePath = process.env.UIX_STORAGE_PATH || path.resolve(os.homedir(), '.homebridge');
        this.customPluginPath = process.env.UIX_CUSTOM_PLUGIN_PATH;
        this.strictPluginResolution = (process.env.UIX_STRICT_PLUGIN_RESOLUTION === '1');
        this.secretPath = path.resolve(this.storagePath, '.uix-secrets');
        this.authPath = path.resolve(this.storagePath, 'auth.json');
        this.accessoryLayoutPath = path.resolve(this.storagePath, 'accessories', 'uiAccessoriesLayout.json');
        this.configBackupPath = path.resolve(this.storagePath, 'backups/config-backups');
        this.instanceBackupPath = path.resolve(this.storagePath, 'backups/instance-backups');
        this.homebridgeInsecureMode = Boolean(process.env.UIX_INSECURE_MODE === '1');
        this.homebridgeNoTimestamps = Boolean(process.env.UIX_LOG_NO_TIMESTAMPS === '1');
        this.minimumNodeVersion = '14.15.0';
        this.serviceMode = (process.env.UIX_SERVICE_MODE === '1');
        this.runningInDocker = Boolean(process.env.HOMEBRIDGE_CONFIG_UI === '1');
        this.runningInSynologyPackage = Boolean(process.env.HOMEBRIDGE_SYNOLOGY_PACKAGE === '1');
        this.runningInPackageMode = Boolean(process.env.HOMEBRIDGE_APT_PACKAGE === '1');
        this.runningInLinux = (!this.runningInDocker && !this.runningInSynologyPackage && !this.runningInPackageMode && os.platform() === 'linux');
        this.runningInFreeBSD = (os.platform() === 'freebsd');
        this.canShutdownRestartHost = (this.runningInLinux || process.env.UIX_CAN_SHUTDOWN_RESTART_HOST === '1');
        this.enableTerminalAccess = this.runningInDocker || this.runningInSynologyPackage || this.runningInPackageMode || Boolean(process.env.HOMEBRIDGE_CONFIG_UI_TERMINAL === '1');
        this.usePnpm = (process.env.UIX_USE_PNPM === '1');
        this.usePluginBundles = (process.env.UIX_USE_PLUGIN_BUNDLES === '1');
        this.recommendChildBridges = (os.totalmem() > 2e+9);
        this.runningOnRaspberryPi = false;
        this.startupScript = path.resolve(this.storagePath, 'startup.sh');
        this.dockerOfflineUpdate = this.runningInDocker && semver.satisfies(process.env.CONFIG_UI_VERSION, '>=4.6.2 <=4.44.1', { includePrerelease: true });
        this.package = fs.readJsonSync(path.resolve(process.env.UIX_BASE_PATH, 'package.json'));
        this.setupWizardComplete = true;
        this.customWallpaperPath = path.resolve(this.storagePath, 'ui-wallpaper.jpg');
        this.hbServiceUiRestartRequired = false;
        const homebridgeConfig = fs.readJSONSync(this.configPath);
        this.parseConfig(homebridgeConfig);
        this.checkIfRunningOnRaspberryPi();
    }
    parseConfig(homebridgeConfig) {
        this.homebridgeConfig = homebridgeConfig;
        if (!this.homebridgeConfig.bridge) {
            this.homebridgeConfig.bridge = {};
        }
        this.ui = Array.isArray(this.homebridgeConfig.platforms) ? this.homebridgeConfig.platforms.find(x => x.platform === 'config') : undefined;
        if (!this.ui) {
            this.ui = {
                name: 'Config',
            };
        }
        process.env.UIX_PLUGIN_NAME = this.ui.name || 'homebridge-config-ui-x';
        if (this.runningInDocker) {
            this.setConfigForDocker();
        }
        if (this.serviceMode) {
            this.setConfigForServiceMode();
        }
        if (!this.ui.port) {
            this.ui.port = 8080;
        }
        if (!this.ui.sessionTimeout) {
            this.ui.sessionTimeout = this.ui.auth === 'none' ? 1296000 : 28800;
        }
        if (this.ui.scheduledBackupPath) {
            this.instanceBackupPath = this.ui.scheduledBackupPath;
        }
        else {
            this.instanceBackupPath = path.resolve(this.storagePath, 'backups/instance-backups');
        }
        this.secrets = this.getSecrets();
        this.instanceId = this.getInstanceId();
        this.freezeUiSettings();
        this.getCustomWallpaperHash();
    }
    uiSettings() {
        return {
            env: {
                enableAccessories: this.homebridgeInsecureMode,
                enableTerminalAccess: this.enableTerminalAccess,
                homebridgeVersion: this.homebridgeVersion || null,
                homebridgeInstanceName: this.homebridgeConfig.bridge.name,
                nodeVersion: process.version,
                packageName: this.package.name,
                packageVersion: this.package.version,
                platform: os.platform(),
                runningInDocker: this.runningInDocker,
                runningInSynologyPackage: this.runningInSynologyPackage,
                runningInPackageMode: this.runningInPackageMode,
                runningInLinux: this.runningInLinux,
                runningInFreeBSD: this.runningInFreeBSD,
                runningOnRaspberryPi: this.runningOnRaspberryPi,
                canShutdownRestartHost: this.canShutdownRestartHost,
                dockerOfflineUpdate: this.dockerOfflineUpdate,
                serviceMode: this.serviceMode,
                temperatureUnits: this.ui.tempUnits || 'c',
                lang: this.ui.lang === 'auto' ? null : this.ui.lang,
                instanceId: this.instanceId,
                customWallpaperHash: this.customWallpaperHash,
                setupWizardComplete: this.setupWizardComplete,
                recommendChildBridges: this.recommendChildBridges,
            },
            formAuth: Boolean(this.ui.auth !== 'none'),
            theme: this.ui.theme || 'auto',
            serverTimestamp: new Date().toISOString(),
        };
    }
    async uiRestartRequired() {
        if (this.hbServiceUiRestartRequired) {
            return true;
        }
        const currentPackage = await fs.readJson(path.resolve(process.env.UIX_BASE_PATH, 'package.json'));
        if (currentPackage.version !== this.package.version) {
            return true;
        }
        return !(_.isEqual(this.ui, this.uiFreeze) && _.isEqual(this.homebridgeConfig.bridge, this.bridgeFreeze));
    }
    freezeUiSettings() {
        if (!this.uiFreeze) {
            this.uiFreeze = {};
            Object.assign(this.uiFreeze, this.ui);
        }
        if (!this.bridgeFreeze) {
            this.bridgeFreeze = {};
            Object.assign(this.bridgeFreeze, this.homebridgeConfig.bridge);
        }
    }
    setConfigForDocker() {
        this.ui.restart = 'killall -15 homebridge; sleep 5.1; killall -9 homebridge; kill -9 $(pidof homebridge-config-ui-x);';
        this.homebridgeInsecureMode = Boolean(process.env.HOMEBRIDGE_INSECURE === '1');
        this.ui.sudo = false;
        this.ui.log = {
            method: 'file',
            path: '/homebridge/logs/homebridge.log',
        };
        if (!this.ui.port && process.env.HOMEBRIDGE_CONFIG_UI_PORT) {
            this.ui.port = parseInt(process.env.HOMEBRIDGE_CONFIG_UI_PORT, 10);
        }
        this.ui.theme = this.ui.theme || process.env.HOMEBRIDGE_CONFIG_UI_THEME || 'auto';
        this.ui.auth = this.ui.auth || process.env.HOMEBRIDGE_CONFIG_UI_AUTH || 'form';
        this.ui.loginWallpaper = this.ui.loginWallpaper || process.env.HOMEBRIDGE_CONFIG_UI_LOGIN_WALLPAPER || undefined;
    }
    setConfigForServiceMode() {
        this.homebridgeInsecureMode = Boolean(process.env.UIX_INSECURE_MODE === '1');
        this.ui.restart = undefined;
        this.ui.sudo = (os.platform() === 'linux' && !this.runningInDocker && !this.runningInSynologyPackage && !this.runningInPackageMode) || os.platform() === 'freebsd';
        this.ui.log = {
            method: 'native',
            path: path.resolve(this.storagePath, 'homebridge.log'),
        };
    }
    getSecrets() {
        if (fs.pathExistsSync(this.secretPath)) {
            try {
                const secrets = fs.readJsonSync(this.secretPath);
                if (!secrets.secretKey) {
                    return this.generateSecretToken();
                }
                else {
                    return secrets;
                }
            }
            catch (e) {
                return this.generateSecretToken();
            }
        }
        else {
            return this.generateSecretToken();
        }
    }
    generateSecretToken() {
        const secrets = {
            secretKey: crypto.randomBytes(32).toString('hex'),
        };
        fs.writeJsonSync(this.secretPath, secrets);
        return secrets;
    }
    getInstanceId() {
        return crypto.createHash('sha256').update(this.secrets.secretKey).digest('hex');
    }
    async getCustomWallpaperHash() {
        try {
            const stat = await fs.stat(this.ui.loginWallpaper || this.customWallpaperPath);
            const hash = crypto.createHash('sha256');
            hash.update(`${stat.birthtime}${stat.ctime}${stat.size}${stat.blocks}`);
            this.customWallpaperHash = hash.digest('hex') + '.jpg';
        }
        catch (e) {
        }
    }
    async checkIfRunningOnRaspberryPi() {
        try {
            if (await fs.pathExists('/usr/bin/vcgencmd') && await fs.pathExists('/usr/bin/raspi-config')) {
                this.runningOnRaspberryPi = true;
            }
            else {
                this.runningOnRaspberryPi = false;
            }
        }
        catch (e) {
            this.runningOnRaspberryPi = false;
        }
    }
    streamCustomWallpaper() {
        return fs.createReadStream(this.ui.loginWallpaper || this.customWallpaperPath);
    }
};
ConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ConfigService);
exports.ConfigService = ConfigService;
//# sourceMappingURL=config.service.js.map