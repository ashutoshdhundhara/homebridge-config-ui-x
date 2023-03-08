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
var PluginsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const axios_2 = require("axios");
const os = require("os");
const _ = require("lodash");
const path = require("path");
const fs = require("fs-extra");
const child_process = require("child_process");
const semver = require("semver");
const color = require("bash-color");
const NodeCache = require("node-cache");
const pLimit = require("p-limit");
const logger_service_1 = require("../../core/logger/logger.service");
const config_service_1 = require("../../core/config/config.service");
const node_pty_service_1 = require("../../core/node-pty/node-pty.service");
let PluginsService = PluginsService_1 = class PluginsService {
    constructor(httpService, nodePtyService, logger, configService) {
        this.httpService = httpService;
        this.nodePtyService = nodePtyService;
        this.logger = logger;
        this.configService = configService;
        this.npm = this.getNpmPath();
        this.paths = this.getBasePaths();
        this.verifiedPlugins = [];
        this.miscSchemas = {};
        this.npmPluginCache = new NodeCache({ stdTTL: 300 });
        this.pluginAliasCache = new NodeCache({ stdTTL: 86400 });
        this.searchResultBlacklist = [
            'homebridge-config-ui',
            'homebridge-config-ui-rdp',
            'homebridge-rocket-smart-home-ui',
            'homebridge-ui',
            'homebridge-to-hoobs',
            'homebridge-server',
        ];
        this.pluginAliasHints = {
            'homebridge-broadlink-rm-pro': {
                pluginAlias: 'BroadlinkRM',
                pluginType: 'platform'
            }
        };
        this.httpService.axiosRef.interceptors.request.use((config) => {
            const source = axios_2.default.CancelToken.source();
            config.cancelToken = source.token;
            setTimeout(() => {
                source.cancel('Timeout: request took more than 15 seconds');
            }, 15000);
            return config;
        });
        this.loadVerifiedPluginsList();
        setInterval(this.loadVerifiedPluginsList.bind(this), 60000 * 60 * 12);
    }
    async getInstalledPlugins() {
        const plugins = [];
        const modules = await this.getInstalledModules();
        const disabledPlugins = await this.getDisabledPlugins();
        const homebridgePlugins = modules
            .filter(module => (module.name.indexOf('homebridge-') === 0) || this.isScopedPlugin(module.name))
            .filter(module => fs.pathExistsSync(path.join(module.installPath, 'package.json')));
        const limit = pLimit(os.cpus().length);
        await Promise.all(homebridgePlugins.map(async (pkg) => {
            return limit(async () => {
                try {
                    const pjson = await fs.readJson(path.join(pkg.installPath, 'package.json'));
                    if (pjson.keywords && pjson.keywords.includes('homebridge-plugin')) {
                        const plugin = await this.parsePackageJson(pjson, pkg.path);
                        plugin.disabled = disabledPlugins.includes(plugin.name);
                        if (!plugins.find(x => plugin.name === x.name)) {
                            plugins.push(plugin);
                        }
                        else if (!plugin.globalInstall && plugins.find(x => plugin.name === x.name && x.globalInstall === true)) {
                            const index = plugins.findIndex(x => plugin.name === x.name && x.globalInstall === true);
                            plugins[index] = plugin;
                        }
                    }
                }
                catch (e) {
                    this.logger.error(`Failed to parse plugin "${pkg.name}": ${e.message}`);
                }
            });
        }));
        this.installedPlugins = plugins;
        return _.orderBy(plugins, [(resultItem) => { return resultItem.name === this.configService.name; }, 'updateAvailable', 'name'], ['desc', 'desc', 'asc']);
    }
    async getOutOfDatePlugins() {
        const plugins = await this.getInstalledPlugins();
        return plugins.filter(x => x.updateAvailable);
    }
    async lookupPlugin(pluginName) {
        if (!PluginsService_1.PLUGIN_IDENTIFIER_PATTERN.test(pluginName)) {
            throw new common_1.BadRequestException('Invalid plugin name.');
        }
        const lookup = await this.searchNpmRegistrySingle(pluginName);
        if (!lookup.length) {
            throw new common_1.NotFoundException();
        }
        return lookup[0];
    }
    async getAvailablePluginVersions(pluginName) {
        if (!PluginsService_1.PLUGIN_IDENTIFIER_PATTERN.test(pluginName) && pluginName !== 'homebridge') {
            throw new common_1.BadRequestException('Invalid plugin name.');
        }
        try {
            const fromCache = this.npmPluginCache.get(`lookup-${pluginName}`);
            const pkg = fromCache || (await (this.httpService.get(`https://registry.npmjs.org/${encodeURIComponent(pluginName).replace('%40', '@')}`, {
                headers: {
                    'accept': 'application/vnd.npm.install-v1+json',
                },
            }).toPromise())).data;
            if (!fromCache) {
                this.npmPluginCache.set(`lookup-${pluginName}`, pkg, 60);
            }
            return {
                tags: pkg['dist-tags'],
                versions: Object.keys(pkg.versions),
            };
        }
        catch (e) {
            throw new common_1.NotFoundException();
        }
    }
    async searchNpmRegistry(query) {
        if (!this.installedPlugins) {
            await this.getInstalledPlugins();
        }
        const q = ((!query || !query.length) ? '' : query + '+') + 'keywords:homebridge-plugin+not:deprecated&size=30';
        let searchResults;
        try {
            searchResults = (await this.httpService.get(`https://registry.npmjs.org/-/v1/search?text=${q}`).toPromise()).data;
        }
        catch (e) {
            this.logger.error(`Failed to search the npm registry - "${e.message}" - see https://homebridge.io/w/JJSz6 for help.`);
            throw new common_1.InternalServerErrorException(`Failed to search the npm registry - "${e.message}" - see logs.`);
        }
        const result = searchResults.objects
            .filter(x => x.package.name.indexOf('homebridge-') === 0 || this.isScopedPlugin(x.package.name))
            .filter(x => !this.searchResultBlacklist.includes(x.package.name))
            .map((pkg) => {
            let plugin = {
                name: pkg.package.name,
                private: false,
            };
            const isInstalled = this.installedPlugins.find(x => x.name === plugin.name);
            if (isInstalled) {
                plugin = isInstalled;
                plugin.lastUpdated = pkg.package.date;
                return plugin;
            }
            plugin.publicPackage = true;
            plugin.installedVersion = null;
            plugin.latestVersion = pkg.package.version;
            plugin.lastUpdated = pkg.package.date;
            plugin.description = (pkg.package.description) ?
                pkg.package.description.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').trim() : pkg.package.name;
            plugin.links = pkg.package.links;
            plugin.author = (pkg.package.publisher) ? pkg.package.publisher.username : null;
            plugin.verifiedPlugin = this.verifiedPlugins.includes(pkg.package.name);
            return plugin;
        });
        if (!result.length
            && (query.indexOf('homebridge-') === 0 || this.isScopedPlugin(query))
            && !this.searchResultBlacklist.includes(query.toLowerCase())) {
            return await this.searchNpmRegistrySingle(query.toLowerCase());
        }
        return _.orderBy(result, ['verifiedPlugin'], ['desc']);
    }
    async searchNpmRegistrySingle(query) {
        var _a;
        try {
            const fromCache = this.npmPluginCache.get(`lookup-${query}`);
            const pkg = fromCache || (await (this.httpService.get(`https://registry.npmjs.org/${encodeURIComponent(query).replace('%40', '@')}`).toPromise())).data;
            if (!fromCache) {
                this.npmPluginCache.set(`lookup-${query}`, pkg, 60);
            }
            if (!pkg.keywords || !pkg.keywords.includes('homebridge-plugin')) {
                return [];
            }
            let plugin;
            if (!this.installedPlugins)
                await this.getInstalledPlugins();
            const isInstalled = this.installedPlugins.find(x => x.name === pkg.name);
            if (isInstalled) {
                plugin = isInstalled;
                plugin.lastUpdated = pkg.time.modified;
                return [plugin];
            }
            plugin = {
                name: pkg.name,
                private: false,
                description: (pkg.description) ?
                    pkg.description.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').trim() : pkg.name,
                verifiedPlugin: this.verifiedPlugins.includes(pkg.name),
            };
            plugin.publicPackage = true;
            plugin.latestVersion = pkg['dist-tags'] ? pkg['dist-tags'].latest : undefined;
            plugin.lastUpdated = pkg.time.modified;
            plugin.updateAvailable = false;
            plugin.links = {
                npm: `https://www.npmjs.com/package/${plugin.name}`,
                homepage: pkg.homepage,
            };
            plugin.author = (pkg.maintainers.length) ? pkg.maintainers[0].name : null;
            plugin.verifiedPlugin = this.verifiedPlugins.includes(pkg.name);
            return [plugin];
        }
        catch (e) {
            if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) !== 404) {
                this.logger.error(`Failed to search the npm registry - "${e.message}" - see https://homebridge.io/w/JJSz6 for help.`);
            }
            return [];
        }
    }
    async managePlugin(action, pluginAction, client) {
        pluginAction.version = pluginAction.version || 'latest';
        if (action === 'uninstall' && pluginAction.name === this.configService.name) {
            throw new Error(`Cannot uninstall ${pluginAction.name} from ${this.configService.name}.`);
        }
        if (pluginAction.name === this.configService.name && this.configService.dockerOfflineUpdate && pluginAction.version === 'latest') {
            await this.updateSelfOffline(client);
            return true;
        }
        if (action === 'install' && pluginAction.version === 'latest') {
            pluginAction.version = await this.getNpmModuleLatestVersion(pluginAction.name);
        }
        let installPath = (this.configService.customPluginPath) ?
            this.configService.customPluginPath : this.installedPlugins.find(x => x.name === this.configService.name).installPath;
        await this.getInstalledPlugins();
        const existingPlugin = this.installedPlugins.find(x => x.name === pluginAction.name);
        if (existingPlugin) {
            installPath = existingPlugin.installPath;
        }
        if (action === 'install' && pluginAction.name === this.configService.name && await this.isUiUpdateBundleAvailable(pluginAction)) {
            try {
                await this.doUiBundleUpdate(pluginAction, client);
                return true;
            }
            catch (e) {
                client.emit('stdout', color.yellow('\r\nBundled update failed. Trying regular update using npm.\r\n\r\n'));
            }
            if (os.cpus().length === 1 && os.arch() === 'arm') {
                client.emit('stdout', color.yellow('***************************************************************\r\n'));
                client.emit('stdout', color.yellow(`Please be patient while ${this.configService.name} updates.\r\n`));
                client.emit('stdout', color.yellow('This process may take 5-15 minutes to complete on your device.\r\n'));
                client.emit('stdout', color.yellow('***************************************************************\r\n\r\n'));
            }
        }
        if (action === 'install' && await this.isPluginBundleAvailable(pluginAction)) {
            try {
                await this.doPluginBundleUpdate(pluginAction, client);
                return true;
            }
            catch (e) {
                client.emit('stdout', color.yellow('\r\nBundled install / update could not complete. Trying regular install / update using npm.\r\n\r\n'));
            }
        }
        const installOptions = [];
        if (installPath === this.configService.customPluginPath &&
            !(action === 'uninstall' && this.configService.usePnpm) &&
            await fs.pathExists(path.resolve(installPath, '../package.json'))) {
            installOptions.push('--save');
        }
        installPath = path.resolve(installPath, '../');
        if (!this.configService.customPluginPath || os.platform() === 'win32' || (existingPlugin === null || existingPlugin === void 0 ? void 0 : existingPlugin.globalInstall) === true) {
            installOptions.push('-g');
        }
        const npmPluginLabel = action === 'uninstall' ? pluginAction.name : `${pluginAction.name}@${pluginAction.version}`;
        try {
            await this.runNpmCommand([...this.npm, action, ...installOptions, npmPluginLabel], installPath, client, pluginAction.termCols, pluginAction.termRows);
            await this.ensureCustomPluginDirExists();
            return true;
        }
        catch (e) {
            if (pluginAction.name === this.configService.name) {
                client.emit('stdout', color.yellow('\r\nCleaning up npm cache, please wait...\r\n'));
                await this.cleanNpmCache();
                client.emit('stdout', color.yellow(`npm cache cleared, please try updating ${this.configService.name} again.\r\n`));
            }
            throw e;
        }
    }
    async getHomebridgePackage() {
        if (this.configService.ui.homebridgePackagePath) {
            const pjsonPath = path.join(this.configService.ui.homebridgePackagePath, 'package.json');
            if (await fs.pathExists(pjsonPath)) {
                return await this.parsePackageJson(await fs.readJson(pjsonPath), this.configService.ui.homebridgePackagePath);
            }
            else {
                this.logger.error(`"homebridgePath" (${this.configService.ui.homebridgePackagePath}) does not exist`);
            }
        }
        const modules = await this.getInstalledModules();
        const homebridgeInstalls = modules.filter(x => x.name === 'homebridge');
        if (homebridgeInstalls.length > 1) {
            this.logger.warn('Multiple Instances Of Homebridge Found Installed - see https://homebridge.io/w/JJSgm for help.');
            homebridgeInstalls.forEach((instance) => {
                this.logger.warn(instance.installPath);
            });
        }
        if (!homebridgeInstalls.length) {
            this.configService.hbServiceUiRestartRequired = true;
            this.logger.error('Unable To Find Homebridge Installation - see https://homebridge.io/w/JJSgZ for help.');
            throw new Error('Unable To Find Homebridge Installation');
        }
        const homebridgeModule = homebridgeInstalls[0];
        const pjson = await fs.readJson(path.join(homebridgeModule.installPath, 'package.json'));
        const homebridge = await this.parsePackageJson(pjson, homebridgeModule.path);
        if (!homebridge.latestVersion) {
            return homebridge;
        }
        const homebridgeVersion = semver.parse(homebridge.installedVersion);
        if (homebridgeVersion.major === 1 &&
            homebridgeVersion.minor === 2 &&
            semver.gt(homebridge.installedVersion, homebridge.latestVersion)) {
            const versions = await this.getAvailablePluginVersions('homebridge');
            if (versions.tags['release-1.2.x'] && semver.gt(versions.tags['release-1.2.x'], homebridge.installedVersion)) {
                homebridge.updateAvailable = true;
                homebridge.latestVersion = versions.tags['release-1.2.x'];
            }
        }
        if (homebridgeVersion.prerelease[0] === 'beta' &&
            semver.gt(homebridge.installedVersion, homebridge.latestVersion)) {
            const versions = await this.getAvailablePluginVersions('homebridge');
            if (versions.tags['beta'] && semver.gt(versions.tags['beta'], homebridge.installedVersion)) {
                homebridge.updateAvailable = true;
                homebridge.latestVersion = versions.tags['beta'];
            }
        }
        this.configService.homebridgeVersion = homebridge.installedVersion;
        return homebridge;
    }
    async updateHomebridgePackage(homebridgeUpdateAction, client) {
        const homebridge = await this.getHomebridgePackage();
        homebridgeUpdateAction.version = homebridgeUpdateAction.version || 'latest';
        if (homebridgeUpdateAction.version === 'latest' && homebridge.latestVersion) {
            homebridgeUpdateAction.version = homebridge.latestVersion;
        }
        let installPath = homebridge.installPath;
        const installOptions = [];
        if (installPath === this.configService.customPluginPath && await fs.pathExists(path.resolve(installPath, '../package.json'))) {
            installOptions.push('--save');
        }
        installPath = path.resolve(installPath, '../');
        if (homebridge.globalInstall || os.platform() === 'win32') {
            installOptions.push('-g');
        }
        if (homebridge.installedVersion && homebridgeUpdateAction.version) {
            const installedVersion = semver.parse(homebridge.installedVersion);
            const targetVersion = semver.parse(homebridgeUpdateAction.version);
            if (installedVersion.minor === 2 && targetVersion.minor > 2) {
                try {
                    const config = await fs.readJson(this.configService.configPath);
                    config.bridge.advertiser = 'ciao';
                    await fs.writeJsonSync(this.configService.configPath, config);
                }
                catch (e) {
                    this.logger.warn('Could not update config.json', e.message);
                }
            }
        }
        await this.runNpmCommand([...this.npm, 'install', ...installOptions, `${homebridge.name}@${homebridgeUpdateAction.version}`], installPath, client, homebridgeUpdateAction.termCols, homebridgeUpdateAction.termRows);
        return true;
    }
    async getNpmPackage() {
        if (this.npmPackage) {
            return this.npmPackage;
        }
        else {
            const modules = await this.getInstalledModules();
            const npmPkg = modules.find(x => x.name === 'npm');
            if (!npmPkg) {
                throw new Error('Could not find npm package');
            }
            const pjson = await fs.readJson(path.join(npmPkg.installPath, 'package.json'));
            const npm = await this.parsePackageJson(pjson, npmPkg.path);
            npm.showUpdateWarning = semver.lt(npm.installedVersion, '6.4.1');
            this.npmPackage = npm;
            return npm;
        }
    }
    async isPluginBundleAvailable(pluginAction) {
        if (this.configService.usePluginBundles === true &&
            this.configService.customPluginPath &&
            this.configService.strictPluginResolution &&
            pluginAction.name !== this.configService.name &&
            pluginAction.version !== 'latest') {
            try {
                await this.httpService.head(`https://github.com/homebridge/plugin-repo/releases/download/v1/${pluginAction.name.replace('/', '@')}-${pluginAction.version}.sha256`).toPromise();
                return true;
            }
            catch (e) {
                return false;
            }
        }
        else {
            return false;
        }
    }
    async doPluginBundleUpdate(pluginAction, client) {
        const pluginUpgradeInstallScriptPath = path.join(process.env.UIX_BASE_PATH, 'plugin-upgrade-install.sh');
        await this.runNpmCommand([pluginUpgradeInstallScriptPath, pluginAction.name, pluginAction.version, this.configService.customPluginPath], this.configService.storagePath, client, pluginAction.termCols, pluginAction.termRows);
        return true;
    }
    async isUiUpdateBundleAvailable(pluginAction) {
        if ([
            '/usr/local/lib/node_modules',
            '/usr/lib/node_modules',
            '/opt/homebridge/lib/node_modules',
            '/var/packages/homebridge/target/app/lib/node_modules',
        ].includes(path.dirname(process.env.UIX_BASE_PATH)) &&
            pluginAction.name === this.configService.name &&
            pluginAction.version !== 'latest') {
            try {
                await this.httpService.head(`https://github.com/oznu/homebridge-config-ui-x/releases/download/${pluginAction.version}/homebridge-config-ui-x-${pluginAction.version}.tar.gz`).toPromise();
                return true;
            }
            catch (e) {
                return false;
            }
        }
        else {
            return false;
        }
    }
    async doUiBundleUpdate(pluginAction, client) {
        const prefix = path.dirname(path.dirname(path.dirname(process.env.UIX_BASE_PATH)));
        const upgradeInstallScriptPath = path.join(process.env.UIX_BASE_PATH, 'upgrade-install.sh');
        await this.runNpmCommand(this.configService.ui.sudo ? ['npm', 'run', 'upgrade-install', '--', pluginAction.version, prefix] : [upgradeInstallScriptPath, pluginAction.version, prefix], process.env.UIX_BASE_PATH, client, pluginAction.termCols, pluginAction.termRows);
    }
    async updateSelfOffline(client) {
        client.emit('stdout', color.yellow(`${this.configService.name} has been scheduled to update on the next container restart.\n\r\n\r`));
        await new Promise(resolve => setTimeout(resolve, 800));
        client.emit('stdout', color.yellow('The Docker container will now try and restart.\n\r\n\r'));
        await new Promise(resolve => setTimeout(resolve, 800));
        client.emit('stdout', color.yellow('If you have not started the Docker container with ') +
            color.red('--restart=always') + color.yellow(' you may\n\rneed to manually start the container again.\n\r\n\r'));
        await new Promise(resolve => setTimeout(resolve, 800));
        client.emit('stdout', color.yellow('This process may take several minutes. Please be patient.\n\r'));
        await new Promise(resolve => setTimeout(resolve, 10000));
        await fs.createFile('/homebridge/.uix-upgrade-on-restart');
    }
    async getPluginConfigSchema(pluginName) {
        if (!this.installedPlugins)
            await this.getInstalledPlugins();
        const plugin = this.installedPlugins.find(x => x.name === pluginName);
        if (!plugin) {
            throw new common_1.NotFoundException();
        }
        if (!plugin.settingsSchema) {
            throw new common_1.NotFoundException();
        }
        const schemaPath = path.resolve(plugin.installPath, pluginName, 'config.schema.json');
        if (this.miscSchemas[pluginName] && !await fs.pathExists(schemaPath)) {
            return await fs.readJson(this.miscSchemas[pluginName]);
        }
        let configSchema = await fs.readJson(schemaPath);
        if (configSchema.dynamicSchemaVersion) {
            const dynamicSchemaPath = path.resolve(this.configService.storagePath, `.${pluginName}-v${configSchema.dynamicSchemaVersion}.schema.json`);
            this.logger.log(`[${pluginName}] dynamic schema path: ${dynamicSchemaPath}`);
            if (fs.existsSync(dynamicSchemaPath)) {
                try {
                    configSchema = await fs.readJson(dynamicSchemaPath);
                    this.logger.log(`[${pluginName}] dynamic schema loaded from: ${dynamicSchemaPath}`);
                }
                catch (e) {
                    this.logger.error(`[${pluginName}] Failed to load dynamic schema at ${dynamicSchemaPath}: ${e.message}`);
                }
            }
        }
        if (pluginName === this.configService.name) {
            configSchema.schema.properties.port.default = this.configService.ui.port;
            if (this.configService.serviceMode) {
                configSchema.layout = configSchema.layout.filter(x => {
                    if (x.ref === 'log') {
                        return false;
                    }
                    return true;
                });
                const advanced = configSchema.layout.find(x => x.ref === 'advanced');
                advanced.items = advanced.items.filter(x => {
                    if (x === 'sudo' || x.key === 'restart') {
                        return false;
                    }
                    return true;
                });
            }
        }
        if (pluginName === 'homebridge-alexa') {
            configSchema.schema.properties.pin.default = this.configService.homebridgeConfig.bridge.pin;
        }
        if (plugin.displayName) {
            configSchema.displayName = plugin.displayName;
        }
        const childBridgeSchema = {
            type: 'object',
            notitle: true,
            condition: {
                functionBody: 'return false',
            },
            properties: {
                name: {
                    type: 'string',
                },
                username: {
                    type: 'string',
                },
                pin: {
                    type: 'string',
                },
                port: {
                    type: 'integer',
                    maximum: 65535,
                },
                setupID: {
                    type: 'string',
                },
                manufacturer: {
                    type: 'string',
                },
                model: {
                    type: 'string',
                },
            },
        };
        if (configSchema.schema && typeof configSchema.schema.properties === 'object') {
            configSchema.schema.properties._bridge = childBridgeSchema;
        }
        else if (typeof configSchema.schema === 'object') {
            configSchema.schema._bridge = childBridgeSchema;
        }
        return configSchema;
    }
    async getPluginChangeLog(pluginName) {
        await this.getInstalledPlugins();
        const plugin = this.installedPlugins.find(x => x.name === pluginName);
        if (!plugin) {
            throw new common_1.NotFoundException();
        }
        const changeLog = path.resolve(plugin.installPath, plugin.name, 'CHANGELOG.md');
        if (await fs.pathExists(changeLog)) {
            return {
                changelog: await fs.readFile(changeLog, 'utf8'),
            };
        }
        else {
            throw new common_1.NotFoundException();
        }
    }
    async getPluginRelease(pluginName) {
        var _a;
        if (!this.installedPlugins)
            await this.getInstalledPlugins();
        const plugin = pluginName === 'homebridge' ? await this.getHomebridgePackage() : this.installedPlugins.find(x => x.name === pluginName);
        if (!plugin) {
            throw new common_1.NotFoundException();
        }
        if (plugin.name === 'homebridge' && ((_a = plugin.latestVersion) === null || _a === void 0 ? void 0 : _a.includes('beta'))) {
            return {
                name: 'v' + plugin.latestVersion,
                changelog: 'Thank you for helping improve Homebridge by testing the beta build of Homebridge.\n\n\n' +
                    'To see what needs testing or to report issues: https://github.com/homebridge/homebridge/issues\n\n\n' +
                    'See the commit history for recent changes: https://github.com/homebridge/homebridge/commits/beta'
            };
        }
        if (!plugin.links.homepage) {
            throw new common_1.NotFoundException();
        }
        const repoMatch = plugin.links.homepage.match(/https:\/\/github.com\/([^\/]+)\/([^\/#]+)/);
        if (!repoMatch) {
            throw new common_1.NotFoundException();
        }
        try {
            const release = (await this.httpService.get(`https://api.github.com/repos/${repoMatch[1]}/${repoMatch[2]}/releases/latest`).toPromise()).data;
            return {
                name: release.name,
                changelog: release.body,
            };
        }
        catch (e) {
            throw new common_1.NotFoundException();
        }
    }
    async getPluginAlias(pluginName) {
        if (!this.installedPlugins)
            await this.getInstalledPlugins();
        const plugin = this.installedPlugins.find(x => x.name === pluginName);
        if (!plugin) {
            throw new common_1.NotFoundException();
        }
        const fromCache = this.pluginAliasCache.get(pluginName);
        if (fromCache) {
            return fromCache;
        }
        const output = {
            pluginAlias: null,
            pluginType: null,
        };
        if (plugin.settingsSchema) {
            const schema = await this.getPluginConfigSchema(pluginName);
            output.pluginAlias = schema.pluginAlias;
            output.pluginType = schema.pluginType;
        }
        else {
            try {
                await new Promise((resolve, reject) => {
                    const child = child_process.fork(path.resolve(process.env.UIX_BASE_PATH, 'extract-plugin-alias.js'), {
                        env: {
                            UIX_EXTRACT_PLUGIN_PATH: path.resolve(plugin.installPath, plugin.name),
                        },
                        stdio: 'ignore',
                    });
                    child.once('message', (data) => {
                        if (data.pluginAlias && data.pluginType) {
                            output.pluginAlias = data.pluginAlias;
                            output.pluginType = data.pluginType;
                            resolve(null);
                        }
                        else {
                            reject('Invalid Response');
                        }
                    });
                    child.once('close', (code) => {
                        if (code !== 0) {
                            reject();
                        }
                    });
                });
            }
            catch (e) {
                this.logger.debug('Failed to extract plugin alias:', e);
                if (this.pluginAliasHints[pluginName]) {
                    output.pluginAlias = this.pluginAliasHints[pluginName].pluginAlias;
                    output.pluginType = this.pluginAliasHints[pluginName].pluginType;
                }
            }
        }
        this.pluginAliasCache.set(pluginName, output);
        return output;
    }
    async getPluginUiMetadata(pluginName) {
        if (!this.installedPlugins)
            await this.getInstalledPlugins();
        const plugin = this.installedPlugins.find(x => x.name === pluginName);
        const fullPath = path.resolve(plugin.installPath, plugin.name);
        const schema = await fs.readJson(path.resolve(fullPath, 'config.schema.json'));
        const customUiPath = path.resolve(fullPath, schema.customUiPath || 'homebridge-ui');
        const publicPath = path.resolve(customUiPath, 'public');
        const serverPath = path.resolve(customUiPath, 'server.js');
        const devServer = plugin.private ? schema.customUiDevServer : null;
        if (!devServer && !await fs.pathExists(customUiPath)) {
            throw new Error('Plugin does not provide a custom UI at expected location: ' + customUiPath);
        }
        if (!devServer && !(await fs.realpath(customUiPath)).startsWith(await fs.realpath(fullPath))) {
            throw new Error('Custom UI path is outside the plugin root: ' + await fs.realpath(customUiPath));
        }
        if (await fs.pathExists(path.resolve(publicPath, 'index.html')) || devServer) {
            return {
                devServer,
                serverPath,
                publicPath,
                plugin,
            };
        }
        throw new Error('Plugin does not provide a custom UI');
    }
    async getDisabledPlugins() {
        try {
            const config = await fs.readJson(this.configService.configPath);
            if (Array.isArray(config.disabledPlugins)) {
                return config.disabledPlugins;
            }
            else {
                return [];
            }
        }
        catch (e) {
            return [];
        }
    }
    async getInstalledScopedModules(requiredPath, scope) {
        try {
            if ((await fs.stat(path.join(requiredPath, scope))).isDirectory()) {
                const scopedModules = await fs.readdir(path.join(requiredPath, scope));
                return scopedModules
                    .filter((x) => x.startsWith('homebridge-'))
                    .map((x) => {
                    return {
                        name: path.join(scope, x).split(path.sep).join('/'),
                        installPath: path.join(requiredPath, scope, x),
                        path: requiredPath,
                    };
                });
            }
            else {
                return [];
            }
        }
        catch (e) {
            this.logger.log(e);
            return [];
        }
    }
    async getInstalledModules() {
        const allModules = [];
        for (const requiredPath of this.paths) {
            const modules = await fs.readdir(requiredPath);
            for (const module of modules) {
                try {
                    if (module.charAt(0) === '@') {
                        allModules.push(...await this.getInstalledScopedModules(requiredPath, module));
                    }
                    else {
                        allModules.push({
                            name: module,
                            installPath: path.join(requiredPath, module),
                            path: requiredPath,
                        });
                    }
                }
                catch (e) {
                    this.logger.log(`Failed to parse item "${module}" in ${requiredPath}: ${e.message}`);
                }
            }
        }
        if (allModules.findIndex(x => x.name === 'homebridge-config-ui-x') === -1) {
            allModules.push({
                name: 'homebridge-config-ui-x',
                installPath: process.env.UIX_BASE_PATH,
                path: path.dirname(process.env.UIX_BASE_PATH)
            });
        }
        return allModules;
    }
    isScopedPlugin(name) {
        return (name.charAt(0) === '@' && name.split('/').length > 0 && name.split('/')[1].indexOf('homebridge-') === 0);
    }
    getNpmPath() {
        if (os.platform() === 'win32') {
            const windowsNpmPath = [
                path.join(process.env.APPDATA, 'npm/npm.cmd'),
                path.join(process.env.ProgramFiles, 'nodejs/npm.cmd'),
                path.join(process.env.NVM_SYMLINK || process.env.ProgramFiles + '/nodejs', 'npm.cmd'),
            ].filter(fs.existsSync);
            if (windowsNpmPath.length) {
                return [windowsNpmPath[0]];
            }
            else {
                this.logger.error('ERROR: Cannot find npm binary. You will not be able to manage plugins or update homebridge.');
                this.logger.error('ERROR: You might be able to fix this problem by running: npm install -g npm');
            }
        }
        return this.configService.usePnpm ? ['pnpm'] : ['npm'];
    }
    getBasePaths() {
        let paths = [];
        if (this.configService.customPluginPath) {
            paths.unshift(this.configService.customPluginPath);
        }
        if (this.configService.strictPluginResolution) {
            if (!paths.length) {
                paths.push(...this.getNpmPrefixToSearchPaths());
            }
        }
        else {
            paths = paths.concat(eval('require').main.paths);
            if (process.env.NODE_PATH) {
                paths = process.env.NODE_PATH.split(path.delimiter)
                    .filter((p) => !!p)
                    .concat(paths);
            }
            else {
                if ((os.platform() !== 'win32')) {
                    paths.push('/usr/local/lib/node_modules');
                    paths.push('/usr/lib/node_modules');
                }
                paths.push(...this.getNpmPrefixToSearchPaths());
            }
            paths = paths.filter(x => x !== path.join(process.env.UIX_BASE_PATH, 'node_modules'));
        }
        return _.uniq(paths).filter((requiredPath) => {
            return fs.existsSync(requiredPath);
        });
    }
    getNpmPrefixToSearchPaths() {
        const paths = [];
        if ((os.platform() === 'win32')) {
            paths.push(path.join(process.env.APPDATA, 'npm/node_modules'));
        }
        else {
            paths.push(child_process.execSync('/bin/echo -n "$(npm -g prefix)/lib/node_modules"', {
                env: Object.assign({
                    npm_config_loglevel: 'silent',
                    npm_update_notifier: 'false',
                }, process.env),
            }).toString('utf8'));
        }
        return paths;
    }
    async parsePackageJson(pjson, installPath) {
        const plugin = {
            name: pjson.name,
            private: pjson.private || false,
            displayName: pjson.displayName,
            description: (pjson.description) ?
                pjson.description.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').trim() : pjson.name,
            verifiedPlugin: this.verifiedPlugins.includes(pjson.name),
            installedVersion: installPath ? (pjson.version || '0.0.1') : null,
            globalInstall: (installPath !== this.configService.customPluginPath),
            settingsSchema: await fs.pathExists(path.resolve(installPath, pjson.name, 'config.schema.json')) || this.miscSchemas[pjson.name],
            installPath,
        };
        plugin.funding = plugin.verifiedPlugin ? pjson.funding : undefined;
        if (pjson.private) {
            plugin.publicPackage = false;
            plugin.latestVersion = null;
            plugin.updateAvailable = false;
            plugin.links = {};
            return plugin;
        }
        return this.getPluginFromNpm(plugin);
    }
    async getPluginFromNpm(plugin) {
        var _a;
        try {
            const fromCache = this.npmPluginCache.get(plugin.name);
            const pkg = fromCache || (await this.httpService.get(`https://registry.npmjs.org/${encodeURIComponent(plugin.name).replace('%40', '@')}/latest`).toPromise()).data;
            if (!fromCache) {
                this.npmPluginCache.set(plugin.name, pkg);
            }
            plugin.publicPackage = true;
            plugin.latestVersion = pkg.version;
            plugin.updateAvailable = semver.lt(plugin.installedVersion, plugin.latestVersion);
            plugin.links = {
                npm: `https://www.npmjs.com/package/${plugin.name}`,
                homepage: pkg.homepage,
            };
            plugin.author = (pkg.maintainers.length) ? pkg.maintainers[0].name : null;
            plugin.engines = pkg.engines;
        }
        catch (e) {
            if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) !== 404) {
                this.logger.log(`[${plugin.name}] Failed to check registry.npmjs.org for updates: "${e.message}" - see https://homebridge.io/w/JJSz6 for help.`);
            }
            plugin.publicPackage = false;
            plugin.latestVersion = null;
            plugin.updateAvailable = false;
            plugin.links = {};
        }
        return plugin;
    }
    async getNpmModuleLatestVersion(npmModuleName) {
        try {
            const response = await this.httpService.get(`https://registry.npmjs.org/${npmModuleName}/latest`).toPromise();
            return response.data.version;
        }
        catch (e) {
            return 'latest';
        }
    }
    async runNpmCommand(command, cwd, client, cols, rows) {
        await this.removeSynologyMetadata();
        let timeoutTimer;
        command = command.filter(x => x.length);
        if (this.configService.ui.sudo) {
            command.unshift('sudo', '-E', '-n');
        }
        else {
            try {
                await fs.access(path.resolve(cwd, 'node_modules'), fs.constants.W_OK);
            }
            catch (e) {
                client.emit('stdout', color.yellow(`The user "${os.userInfo().username}" does not have write access to the target directory:\n\r\n\r`));
                client.emit('stdout', `${path.resolve(cwd, 'node_modules')}\n\r\n\r`);
                client.emit('stdout', color.yellow('This may cause the operation to fail.\n\r'));
                client.emit('stdout', color.yellow('See the docs for details on how to enable sudo mode:\n\r'));
                client.emit('stdout', color.yellow('https://github.com/oznu/homebridge-config-ui-x#sudo-mode\n\r\n\r'));
            }
        }
        this.logger.log(`Running Command: ${command.join(' ')}`);
        if (!semver.satisfies(process.version, `>=${this.configService.minimumNodeVersion}`)) {
            client.emit('stdout', color.yellow(`Node.js v${this.configService.minimumNodeVersion} higher is required for ${this.configService.name}.\n\r`));
            client.emit('stdout', color.yellow(`You may experience issues while running on Node.js ${process.version}.\n\r\n\r`));
        }
        const env = {};
        Object.assign(env, process.env);
        Object.assign(env, {
            npm_config_global_style: 'true',
            npm_config_unsafe_perm: 'true',
            npm_config_update_notifier: 'false',
            npm_config_prefer_online: 'true',
            npm_config_foreground_scripts: 'true',
        });
        if (!this.configService.usePnpm) {
            Object.assign(env, {
                npm_config_loglevel: 'error',
            });
        }
        if (command.includes('-g') && path.basename(cwd) === 'lib') {
            cwd = path.dirname(cwd);
            Object.assign(env, {
                npm_config_prefix: cwd,
            });
        }
        if (os.platform() === 'win32') {
            Object.assign(env, {
                npm_config_prefix: cwd,
            });
        }
        client.emit('stdout', color.cyan(`USER: ${os.userInfo().username}\n\r`));
        client.emit('stdout', color.cyan(`DIR: ${cwd}\n\r`));
        client.emit('stdout', color.cyan(`CMD: ${command.join(' ')}\n\r\n\r`));
        await new Promise((resolve, reject) => {
            const term = this.nodePtyService.spawn(command.shift(), command, {
                name: 'xterm-color',
                cols: cols || 80,
                rows: rows || 30,
                cwd,
                env,
            });
            term.on('data', (data) => {
                client.emit('stdout', data);
            });
            term.on('exit', (code) => {
                if (code === 0) {
                    clearTimeout(timeoutTimer);
                    client.emit('stdout', color.green('\n\rOperation succeeded!.\n\r'));
                    resolve(null);
                }
                else {
                    clearTimeout(timeoutTimer);
                    reject('Operation failed. Please review log for details.');
                }
            });
            timeoutTimer = setTimeout(() => {
                term.kill('SIGTERM');
            }, 300000);
        });
    }
    async ensureCustomPluginDirExists() {
        if (!this.configService.customPluginPath) {
            return;
        }
        if (!await fs.pathExists(this.configService.customPluginPath)) {
            this.logger.warn(`Custom plugin directory was removed. Re-creating: ${this.configService.customPluginPath}`);
            try {
                await fs.ensureDir(this.configService.customPluginPath);
            }
            catch (e) {
                this.logger.error('Failed to recreate custom plugin directory');
                this.logger.error(e.message);
            }
        }
    }
    async removeSynologyMetadata() {
        if (!this.configService.customPluginPath) {
            return;
        }
        const offendingPath = path.resolve(this.configService.customPluginPath, '@eaDir');
        try {
            if (!await fs.pathExists(offendingPath)) {
                await fs.remove(offendingPath);
            }
        }
        catch (e) {
            this.logger.error(`Failed to remove ${offendingPath}`, e.message);
            return;
        }
    }
    async cleanNpmCache() {
        const command = [...this.npm, 'cache', 'clean', '--force'];
        if (this.configService.ui.sudo) {
            command.unshift('sudo', '-E', '-n');
        }
        return new Promise((resolve) => {
            const child = child_process.spawn(command.shift(), command);
            child.on('exit', (code) => {
                this.logger.log('npm cache clear command executed with exit code', code);
                resolve(null);
            });
            child.on('error', () => {
            });
        });
    }
    async loadVerifiedPluginsList() {
        clearTimeout(this.verifiedPluginsRetryTimeout);
        try {
            this.verifiedPlugins = (await this.httpService.get('https://raw.githubusercontent.com/homebridge/verified/master/verified-plugins.json', {
                httpsAgent: null,
            }).toPromise()).data;
        }
        catch (e) {
            this.logger.debug('Error when trying to get verified plugin list:', e.message);
            this.verifiedPluginsRetryTimeout = setTimeout(() => {
                this.loadVerifiedPluginsList();
            }, 60000);
        }
    }
};
PluginsService.PLUGIN_IDENTIFIER_PATTERN = /^((@[\w-]*)\/)?(homebridge-[\w-]*)$/;
PluginsService = PluginsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        node_pty_service_1.NodePtyService,
        logger_service_1.Logger,
        config_service_1.ConfigService])
], PluginsService);
exports.PluginsService = PluginsService;
//# sourceMappingURL=plugins.service.js.map