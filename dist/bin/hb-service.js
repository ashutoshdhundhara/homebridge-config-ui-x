#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomebridgeServiceHelper = void 0;
process.title = 'hb-service';
const os = require("os");
const path = require("path");
const commander = require("commander");
const child_process = require("child_process");
const fs = require("fs-extra");
const tcpPortUsed = require("tcp-port-used");
const si = require("systeminformation");
const semver = require("semver");
const ora = require("ora");
const tar = require("tar");
const axios_1 = require("axios");
const tail_1 = require("tail");
const win32_1 = require("./platforms/win32");
const linux_1 = require("./platforms/linux");
const darwin_1 = require("./platforms/darwin");
const freebsd_1 = require("./platforms/freebsd");
class HomebridgeServiceHelper {
    get logPath() {
        return path.resolve(this.storagePath, 'homebridge.log');
    }
    constructor() {
        this.selfPath = __filename;
        this.serviceName = 'Homebridge';
        this.usingCustomStoragePath = false;
        this.allowRunRoot = false;
        this.enableHbServicePluginManagement = false;
        this.homebridgeStopped = true;
        this.homebridgeOpts = ['-I'];
        this.homebridgeCustomEnv = {};
        this.uiPort = 8581;
        this.nodeVersionCheck();
        switch (os.platform()) {
            case 'linux':
                this.installer = new linux_1.LinuxInstaller(this);
                break;
            case 'win32':
                this.installer = new win32_1.Win32Installer(this);
                break;
            case 'darwin':
                this.installer = new darwin_1.DarwinInstaller(this);
                break;
            case 'freebsd':
                this.installer = new freebsd_1.FreeBSDInstaller(this);
                break;
            default:
                this.logger(`ERROR: This command is not supported on ${os.platform()}.`, 'fail');
                process.exit(1);
        }
        commander
            .allowUnknownOption()
            .storeOptionsAsProperties(true)
            .arguments('[install|uninstall|start|stop|restart|rebuild|run|logs|add|remove]')
            .option('-P, --plugin-path <path>', '', (p) => { process.env.UIX_CUSTOM_PLUGIN_PATH = p; this.homebridgeOpts.push('-P', p); })
            .option('-U, --user-storage-path <path>', '', (p) => { this.storagePath = p; this.usingCustomStoragePath = true; })
            .option('-S, --service-name <service name>', 'The name of the homebridge service to install or control', (p) => this.serviceName = p)
            .option('-T, --no-timestamp', '', () => this.homebridgeOpts.push('-T'))
            .option('--strict-plugin-resolution', '', () => { process.env.UIX_STRICT_PLUGIN_RESOLUTION = '1'; })
            .option('--port <port>', 'The port to set to the Homebridge UI when installing as a service', (p) => this.uiPort = parseInt(p, 10))
            .option('--user <user>', 'The user account the Homebridge service will be installed as (Linux, FreeBSD, macOS only)', (p) => this.asUser = p)
            .option('--stdout', '', () => this.stdout = true)
            .option('--allow-root', '', () => this.allowRunRoot = true)
            .option('--docker', '', () => this.docker = true)
            .option('--uid <number>', '', (i) => this.uid = parseInt(i, 10))
            .option('--gid <number>', '', (i) => this.gid = parseInt(i, 10))
            .option('-v, --version', 'output the version number', () => this.showVersion())
            .action((cmd) => {
            this.action = cmd;
        })
            .parse(process.argv);
        this.setEnv();
        switch (this.action) {
            case 'install': {
                this.nvmCheck();
                this.logger(`Installing ${this.serviceName} Service`);
                this.installer.install();
                break;
            }
            case 'uninstall': {
                this.logger(`Removing ${this.serviceName} Service`);
                this.installer.uninstall();
                break;
            }
            case 'start': {
                this.installer.start();
                break;
            }
            case 'stop': {
                this.installer.stop();
                break;
            }
            case 'restart': {
                this.logger(`Restarting ${this.serviceName} Service`);
                this.installer.restart();
                break;
            }
            case 'rebuild': {
                this.logger(`Rebuilding for Node.js ${process.version}...`);
                this.installer.rebuild(commander.args.includes('--all'));
                break;
            }
            case 'run': {
                this.launch();
                break;
            }
            case 'logs': {
                this.tailLogs();
                break;
            }
            case 'add': {
                this.npmPluginManagement(commander.args);
                break;
            }
            case 'remove': {
                this.npmPluginManagement(commander.args);
                break;
            }
            case 'update-node': {
                this.checkForNodejsUpdates(commander.args.length === 2 ? commander.args[1] : null);
                break;
            }
            case 'before-start': {
                this.installer.beforeStart();
                break;
            }
            case 'status': {
                this.checkStatus();
                break;
            }
            default: {
                commander.outputHelp();
                console.log('\nThe hb-service command is provided by homebridge-config-ui-x\n');
                console.log('Please provide a command:');
                console.log('    install                          install homebridge as a service');
                console.log('    uninstall                        remove the homebridge service');
                console.log('    start                            start the homebridge service');
                console.log('    stop                             stop the homebridge service');
                console.log('    restart                          restart the homebridge service');
                if (this.enableHbServicePluginManagement) {
                    console.log('    add <plugin>@<version>           install a plugin');
                    console.log('    remove <plugin>@<version>        remove a plugin');
                }
                console.log('    rebuild                          rebuild ui');
                console.log('    rebuild --all                    rebuild all npm modules (use after updating Node.js)');
                console.log('    run                              run homebridge daemon');
                console.log('    logs                             tails the homebridge service logs');
                console.log('    update-node [version]            update Node.js');
                console.log('\nSee the wiki for help with hb-service: https://homebridge.io/w/JTtHK \n');
                process.exit(1);
            }
        }
    }
    logger(msg, type = 'info') {
        if (this.action === 'run') {
            msg = `\x1b[37m[${new Date().toLocaleString()}]\x1b[0m ` +
                '\x1b[36m[HB Supervisor]\x1b[0m ' + msg;
            if (this.log) {
                this.log.write(msg + '\n');
            }
            else {
                console.log(msg);
            }
        }
        else {
            ora()[type](msg);
        }
    }
    setEnv() {
        if (!this.serviceName.match(/^[a-z0-9-]+$/i)) {
            this.logger('ERROR: Service name must not contain spaces or special characters', 'fail');
            process.exit(1);
        }
        if (!this.storagePath) {
            if (os.platform() === 'linux' || os.platform() === 'freebsd') {
                this.storagePath = path.resolve('/var/lib', this.serviceName.toLowerCase());
            }
            else {
                this.storagePath = path.resolve(os.homedir(), `.${this.serviceName.toLowerCase()}`);
            }
        }
        if (process.env.CONFIG_UI_VERSION && process.env.HOMEBRIDGE_VERSION && process.env.QEMU_ARCH) {
            if (os.platform() === 'linux' && ['install', 'uninstall', 'start', 'stop', 'restart', 'logs'].includes(this.action)) {
                this.logger(`Sorry, the ${this.action} command is not supported in Docker.`, 'fail');
                process.exit(1);
            }
        }
        this.enableHbServicePluginManagement = (process.env.UIX_CUSTOM_PLUGIN_PATH &&
            (Boolean(process.env.HOMEBRIDGE_SYNOLOGY_PACKAGE === '1') || Boolean(process.env.HOMEBRIDGE_APT_PACKAGE === '1')));
        process.env.UIX_STORAGE_PATH = this.storagePath;
        process.env.UIX_CONFIG_PATH = path.resolve(this.storagePath, 'config.json');
        process.env.UIX_BASE_PATH = process.env.UIX_BASE_PATH_OVERRIDE || path.resolve(__dirname, '../../');
        process.env.UIX_SERVICE_MODE = '1';
        process.env.UIX_INSECURE_MODE = '1';
    }
    showVersion() {
        const pjson = fs.readJsonSync(path.resolve(__dirname, '../../', 'package.json'));
        console.log('v' + pjson.version);
        process.exit(0);
    }
    async startLog() {
        if (this.stdout === true) {
            this.log = process.stdout;
            return;
        }
        this.logger(`Logging to ${this.logPath}`);
        this.log = fs.createWriteStream(this.logPath, { flags: 'a' });
        process.stdout.write = process.stderr.write = this.log.write.bind(this.log);
    }
    async truncateLog() {
        if (!await fs.pathExists(this.logPath)) {
            return;
        }
        const maxSize = 1000000;
        const truncateSize = 200000;
        try {
            const logStats = await fs.stat(this.logPath);
            if (logStats.size < maxSize) {
                return;
            }
            const logStartPosition = logStats.size - truncateSize;
            const logBuffer = Buffer.alloc(truncateSize);
            const logFileHandle = await fs.open(this.logPath, 'a+');
            await fs.read(logFileHandle, logBuffer, 0, truncateSize, logStartPosition);
            await fs.ftruncate(logFileHandle);
            await fs.write(logFileHandle, logBuffer);
            await fs.close(logFileHandle);
        }
        catch (e) {
            this.logger(`Failed to truncate log file: ${e.message}`, 'fail');
        }
    }
    async launch() {
        if (os.platform() !== 'win32' && process.getuid() === 0 && !this.allowRunRoot) {
            this.logger('The hb-service run command should not be executed as root.');
            this.logger('Use the --allow-root flag to force the service to run as the root user.');
            process.exit(0);
        }
        this.logger(`Homebridge Storage Path: ${this.storagePath}`);
        this.logger(`Homebridge Config Path: ${process.env.UIX_CONFIG_PATH}`);
        setInterval(() => {
            this.truncateLog();
        }, (1000 * 60 * 60) * 2);
        try {
            await this.storagePathCheck();
            await this.startLog();
            await this.configCheck();
            this.logger(`OS: ${os.type()} ${os.release()} ${os.arch()}`);
            this.logger(`Node.js ${process.version} ${process.execPath}`);
            this.homebridgeBinary = await this.findHomebridgePath();
            this.logger(`Homebridge Path: ${this.homebridgeBinary}`);
            await this.loadHomebridgeStartupOptions();
            this.uiBinary = path.resolve(process.env.UIX_BASE_PATH, 'dist', 'bin', 'standalone.js');
            this.logger(`UI Path: ${this.uiBinary}`);
        }
        catch (e) {
            this.logger(e.message);
            process.exit(1);
        }
        this.startExitHandler();
        await this.runUi();
        if (this.ipcService && this.homebridgePackage) {
            this.ipcService.setHomebridgeVersion(this.homebridgePackage.version);
        }
        if (os.cpus().length === 1 && os.arch() === 'arm') {
            this.logger('Delaying Homebridge startup by 20 seconds on low powered server');
            setTimeout(() => {
                this.runHomebridge();
            }, 20000);
        }
        else {
            this.runHomebridge();
        }
    }
    startExitHandler() {
        const exitHandler = () => {
            this.logger('Stopping services...');
            try {
                this.homebridge.kill();
            }
            catch (e) { }
            setTimeout(() => {
                try {
                    this.homebridge.kill('SIGKILL');
                }
                catch (e) { }
                process.exit(1282);
            }, 7000);
        };
        process.on('SIGTERM', exitHandler);
        process.on('SIGINT', exitHandler);
    }
    runHomebridge() {
        this.homebridgeStopped = false;
        if (!this.homebridgeBinary || !fs.pathExistsSync(this.homebridgeBinary)) {
            this.logger('Could not find Homebridge. Make sure you have installed homebridge using the -g flag then restart.', 'fail');
            this.logger('npm install -g --unsafe-perm homebridge', 'fail');
            return;
        }
        if (this.homebridgePackage &&
            process.env.UIX_STRICT_PLUGIN_RESOLUTION === '1' &&
            semver.gte(this.homebridgePackage.version, '1.4.1-beta.1')) {
            if (!this.homebridgeOpts.includes('--strict-plugin-resolution')) {
                this.homebridgeOpts.push('--strict-plugin-resolution');
            }
        }
        else if (process.env.UIX_STRICT_PLUGIN_RESOLUTION === '1') {
            const strictPluginIndex = this.homebridgeOpts.indexOf('--strict-plugin-resolution');
            if (strictPluginIndex > -1) {
                this.homebridgeOpts.splice(strictPluginIndex, 1);
            }
        }
        if (this.homebridgeOpts.length) {
            this.logger(`Starting Homebridge with extra flags: ${this.homebridgeOpts.join(' ')}`);
        }
        if (Object.keys(this.homebridgeCustomEnv).length) {
            this.logger(`Starting Homebridge with custom env: ${JSON.stringify(this.homebridgeCustomEnv)}`);
        }
        const env = {};
        Object.assign(env, process.env);
        Object.assign(env, this.homebridgeCustomEnv);
        const childProcessOpts = {
            env,
            silent: true,
        };
        if (this.allowRunRoot && this.uid && this.gid) {
            childProcessOpts.uid = this.uid;
            childProcessOpts.gid = this.gid;
        }
        if (this.docker) {
            this.fixDockerPermissions();
        }
        this.homebridge = child_process.fork(this.homebridgeBinary, [
            '-C',
            '-Q',
            '-U',
            this.storagePath,
            ...this.homebridgeOpts,
        ], childProcessOpts);
        if (this.ipcService) {
            this.ipcService.setHomebridgeProcess(this.homebridge);
            this.ipcService.setHomebridgeVersion(this.homebridgePackage.version);
        }
        this.logger(`Started Homebridge v${this.homebridgePackage.version} with PID: ${this.homebridge.pid}`);
        this.homebridge.stdout.on('data', (data) => {
            this.log.write(data);
        });
        this.homebridge.stderr.on('data', (data) => {
            this.log.write(data);
        });
        this.homebridge.on('close', (code, signal) => {
            this.handleHomebridgeClose(code, signal);
        });
    }
    handleHomebridgeClose(code, signal) {
        this.homebridgeStopped = true;
        this.logger(`Homebridge Process Ended. Code: ${code}, Signal: ${signal}`);
        this.checkForStaleHomebridgeProcess();
        this.refreshHomebridgePackage();
        setTimeout(() => {
            this.logger('Restarting Homebridge...');
            this.runHomebridge();
        }, 5000);
    }
    async runUi() {
        try {
            const main = await Promise.resolve().then(() => require('../main'));
            const ui = await main.app;
            this.ipcService = ui.get(main.HomebridgeIpcService);
        }
        catch (e) {
            this.logger('ERROR: The user interface threw an unhandled error');
            console.error(e);
            setTimeout(() => {
                process.exit(1);
            }, 4500);
            if (this.homebridge) {
                this.homebridge.kill();
            }
        }
    }
    async getNpmGlobalModulesDirectory() {
        try {
            const npmPrefix = child_process.execSync('npm -g prefix', {
                env: Object.assign({
                    npm_config_loglevel: 'silent',
                    npm_update_notifier: 'false',
                }, process.env)
            }).toString('utf8').trim();
            return os.platform() === 'win32' ? path.join(npmPrefix, 'node_modules') : path.join(npmPrefix, 'lib', 'node_modules');
        }
        catch (e) {
            return null;
        }
    }
    async findHomebridgePath() {
        const nodeModules = path.resolve(process.env.UIX_BASE_PATH, '..');
        if (await fs.pathExists(path.resolve(nodeModules, 'homebridge', 'package.json'))) {
            this.homebridgeModulePath = path.resolve(nodeModules, 'homebridge');
        }
        if (!this.homebridgeModulePath && !(process.env.UIX_STRICT_PLUGIN_RESOLUTION === '1' && process.env.UIX_CUSTOM_PLUGIN_PATH)) {
            const globalModules = await this.getNpmGlobalModulesDirectory();
            if (globalModules && await fs.pathExists(path.resolve(globalModules, 'homebridge'))) {
                this.homebridgeModulePath = path.resolve(globalModules, 'homebridge');
            }
        }
        if (!this.homebridgeModulePath && process.env.UIX_CUSTOM_PLUGIN_PATH) {
            if (await fs.pathExists(path.resolve(process.env.UIX_CUSTOM_PLUGIN_PATH, 'homebridge', 'package.json'))) {
                this.homebridgeModulePath = path.resolve(process.env.UIX_CUSTOM_PLUGIN_PATH, 'homebridge');
            }
        }
        if (this.homebridgeModulePath) {
            try {
                await this.refreshHomebridgePackage();
                return path.resolve(this.homebridgeModulePath, this.homebridgePackage.bin.homebridge);
            }
            catch (e) {
                console.log(e);
            }
        }
        return null;
    }
    async refreshHomebridgePackage() {
        try {
            if (await fs.pathExists(this.homebridgeModulePath)) {
                this.homebridgePackage = await fs.readJson(path.join(this.homebridgeModulePath, 'package.json'));
            }
            else {
                this.logger(`Homebridge not longer found at ${this.homebridgeModulePath}`, 'fail');
                this.homebridgeModulePath = undefined;
                this.homebridgeBinary = await this.findHomebridgePath();
                this.logger(`Found New Homebridge Path: ${this.homebridgeBinary}`);
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    nodeVersionCheck() {
        if (parseInt(process.versions.modules, 10) < 64) {
            this.logger(`ERROR: Node.js v10.13.0 or greater is required. Current: ${process.version}.`, 'fail');
            process.exit(1);
        }
    }
    nvmCheck() {
        if (process.execPath.includes('nvm') && os.platform() === 'linux') {
            this.logger('WARNING: It looks like you are running Node.js via NVM (Node Version Manager).\n' +
                '  Using hb-service with NVM may not work unless you have configured NVM for the\n' +
                '  user this service will run as. See https://homebridge.io/w/JUZ2g for instructions on how\n' +
                '  to remove NVM, then follow the wiki instructions to install Node.js and Homebridge.', 'warn');
        }
    }
    async printPostInstallInstructions() {
        const defaultAdapter = await si.networkInterfaceDefault();
        const defaultInterface = (await si.networkInterfaces()).find(x => x.iface === defaultAdapter);
        console.log('\nManage Homebridge by going to one of the following in your browser:\n');
        console.log(`* http://localhost:${this.uiPort}`);
        if (defaultInterface && defaultInterface.ip4) {
            console.log(`* http://${defaultInterface.ip4}:${this.uiPort}`);
        }
        if (defaultInterface && defaultInterface.ip6) {
            console.log(`* http://[${defaultInterface.ip6}]:${this.uiPort}`);
        }
        console.log('');
        this.logger('Homebridge Setup Complete', 'succeed');
    }
    async portCheck() {
        const inUse = await tcpPortUsed.check(this.uiPort);
        if (inUse) {
            this.logger(`ERROR: Port ${this.uiPort} is already in use by another process on this host.`, 'fail');
            this.logger('You can specify another port using the --port flag, eg.', 'fail');
            this.logger(`EXAMPLE: hb-service ${this.action} --port 8581`, 'fail');
            process.exit(1);
        }
    }
    async storagePathCheck() {
        if (os.platform() === 'darwin' && !await fs.pathExists(path.dirname(this.storagePath))) {
            this.logger(`Cannot create Homebridge storage directory, base path does not exist: ${path.dirname(this.storagePath)}`, 'fail');
            process.exit(1);
        }
        if (!await fs.pathExists(this.storagePath)) {
            this.logger(`Creating Homebridge directory: ${this.storagePath}`);
            await fs.mkdirp(this.storagePath);
            await this.chownPath(this.storagePath);
        }
    }
    async configCheck() {
        let saveRequired = false;
        let restartRequired = false;
        if (!await fs.pathExists(process.env.UIX_CONFIG_PATH)) {
            this.logger(`Creating default config.json: ${process.env.UIX_CONFIG_PATH}`);
            await this.createDefaultConfig();
            restartRequired = true;
        }
        try {
            const currentConfig = await fs.readJson(process.env.UIX_CONFIG_PATH);
            if (!Array.isArray(currentConfig.platforms)) {
                currentConfig.platforms = [];
            }
            let uiConfigBlock = currentConfig.platforms.find((x) => x.platform === 'config');
            if (!uiConfigBlock) {
                this.logger(`Adding missing UI platform block to ${process.env.UIX_CONFIG_PATH}`, 'info');
                uiConfigBlock = await this.createDefaultUiConfig();
                currentConfig.platforms.push(uiConfigBlock);
                saveRequired = true;
                restartRequired = true;
            }
            if (this.action !== 'install' && typeof uiConfigBlock.port !== 'number') {
                uiConfigBlock.port = await this.getLastKnownUiPort();
                this.logger(`Added missing port number to UI config - ${uiConfigBlock.port}`, 'info');
                saveRequired = true;
                restartRequired = true;
            }
            if (this.action === 'install') {
                if (uiConfigBlock.port !== this.uiPort) {
                    uiConfigBlock.port = this.uiPort;
                    this.logger(`WARNING: HOMEBRIDGE CONFIG UI PORT IN ${process.env.UIX_CONFIG_PATH} CHANGED TO ${this.uiPort}`, 'warn');
                }
                delete uiConfigBlock.restart;
                delete uiConfigBlock.sudo;
                delete uiConfigBlock.log;
                saveRequired = true;
            }
            if (typeof uiConfigBlock.port !== 'number') {
                uiConfigBlock.port = await this.getLastKnownUiPort();
                this.logger(`Added missing port number to UI config - ${uiConfigBlock.port}`, 'info');
                saveRequired = true;
                restartRequired = true;
            }
            if (!currentConfig.bridge) {
                currentConfig.bridge = await this.generateBridgeConfig();
                this.logger('Added missing Homebridge bridge section to the config.json', 'info');
                saveRequired = true;
            }
            if (!currentConfig.bridge.port) {
                currentConfig.bridge.port = await this.generatePort();
                this.logger(`Added port to the Homebridge bridge section of the config.json: ${currentConfig.bridge.port}`, 'info');
                saveRequired = true;
            }
            if ((uiConfigBlock && currentConfig.bridge.port === uiConfigBlock.port) || currentConfig.bridge.port === 8080) {
                currentConfig.bridge.port = await this.generatePort();
                this.logger(`Bridge port must not be the same as the UI port. Changing bridge port to ${currentConfig.bridge.port}.`, 'info');
                saveRequired = true;
            }
            if (currentConfig.plugins && Array.isArray(currentConfig.plugins)) {
                if (!currentConfig.plugins.includes('homebridge-config-ui-x')) {
                    currentConfig.plugins.push('homebridge-config-ui-x');
                    this.logger('Added homebridge-config-ui-x to the plugins array in the config.json', 'info');
                    saveRequired = true;
                }
            }
            if (saveRequired) {
                await fs.writeJSON(process.env.UIX_CONFIG_PATH, currentConfig, {
                    spaces: 4,
                    mode: 0o777
                });
            }
        }
        catch (e) {
            const backupFile = path.resolve(this.storagePath, 'config.json.invalid.' + new Date().getTime().toString());
            this.logger(`${process.env.UIX_CONFIG_PATH} does not contain valid JSON.`, 'warn');
            this.logger(`Invalid config.json file has been backed up to ${backupFile}.`, 'warn');
            await fs.rename(process.env.UIX_CONFIG_PATH, backupFile);
            await this.createDefaultConfig();
            restartRequired = true;
        }
        if (restartRequired && this.action === 'run' && await this.isRaspbianImage()) {
            this.logger('Restarting process after port number update.', 'info');
            process.exit(1);
        }
    }
    async createDefaultConfig() {
        await fs.writeJson(process.env.UIX_CONFIG_PATH, {
            bridge: await this.generateBridgeConfig(),
            accessories: [],
            platforms: [
                await this.createDefaultUiConfig(),
            ],
        }, {
            spaces: 4,
            mode: 0o777
        });
        await this.chownPath(process.env.UIX_CONFIG_PATH);
    }
    async generateBridgeConfig() {
        const username = this.generateUsername();
        const port = await this.generatePort();
        const name = 'Homebridge ' + username.substr(username.length - 5).replace(/:/g, '');
        const pin = this.generatePin();
        const advertiser = await this.isAvahiDaemonRunning() ? 'avahi' : 'bonjour-hap';
        return {
            name,
            username,
            port,
            pin,
            advertiser,
        };
    }
    async createDefaultUiConfig() {
        return {
            name: 'Config',
            port: this.action === 'install' ? this.uiPort : await this.getLastKnownUiPort(),
            platform: 'config',
        };
    }
    async isRaspbianImage() {
        return os.platform() === 'linux' && await fs.pathExists('/etc/hb-ui-port');
    }
    async getLastKnownUiPort() {
        if (await this.isRaspbianImage()) {
            const lastPort = parseInt((await fs.readFile('/etc/hb-ui-port', 'utf8')), 10);
            if (!isNaN(lastPort) && lastPort <= 65535) {
                return lastPort;
            }
        }
        const envPort = parseInt(process.env.HOMEBRIDGE_CONFIG_UI_PORT, 10);
        if (!isNaN(envPort) && envPort <= 65535) {
            return envPort;
        }
        return this.uiPort;
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
    async generatePort() {
        const randomPort = () => Math.floor(Math.random() * (52000 - 51000 + 1) + 51000);
        let port = randomPort();
        while (await tcpPortUsed.check(port)) {
            port = randomPort();
        }
        return port;
    }
    async isAvahiDaemonRunning() {
        if (os.platform() !== 'linux') {
            return false;
        }
        if (!await fs.pathExists('/etc/avahi/avahi-daemon.conf') || !await fs.pathExists('/usr/bin/systemctl')) {
            return false;
        }
        try {
            if (await fs.pathExists('/usr/lib/systemd/system/avahi.service')) {
                child_process.execSync('systemctl is-active --quiet avahi 2> /dev/null');
                return true;
            }
            else if (await fs.pathExists('/lib/systemd/system/avahi-daemon.service')) {
                child_process.execSync('systemctl is-active --quiet avahi-daemon 2> /dev/null');
                return true;
            }
            else {
                return false;
            }
        }
        catch (e) {
            return false;
        }
    }
    async chownPath(pathToChown) {
        if (os.platform() !== 'win32' && process.getuid() === 0) {
            const { uid, gid } = await this.installer.getId();
            fs.chownSync(pathToChown, uid, gid);
        }
    }
    async checkForStaleHomebridgeProcess() {
        if (os.platform() === 'win32') {
            return;
        }
        try {
            const currentConfig = await fs.readJson(process.env.UIX_CONFIG_PATH);
            if (!currentConfig.bridge || !currentConfig.bridge.port) {
                return;
            }
            if (!await tcpPortUsed.check(parseInt(currentConfig.bridge.port.toString(), 10))) {
                return;
            }
            const pid = parseInt(this.installer.getPidOfPort(parseInt(currentConfig.bridge.port.toString(), 10)), 10);
            if (!pid) {
                return;
            }
            this.logger(`Found stale Homebridge process running on port ${currentConfig.bridge.port} with PID ${pid}, killing...`);
            process.kill(pid, 'SIGKILL');
        }
        catch (e) {
        }
    }
    async tailLogs() {
        if (!fs.existsSync(this.logPath)) {
            this.logger(`ERROR: Log file does not exist at expected location: ${this.logPath}`, 'fail');
            process.exit(1);
        }
        const logStats = await fs.stat(this.logPath);
        const logStartPosition = logStats.size <= 200000 ? 0 : logStats.size - 200000;
        const logStream = fs.createReadStream(this.logPath, { start: logStartPosition });
        logStream.on('data', (buffer) => {
            process.stdout.write(buffer);
        });
        logStream.on('end', () => {
            logStream.close();
        });
        const tail = new tail_1.Tail(this.logPath, {
            fromBeginning: false,
            useWatchFile: true,
            fsWatchOptions: {
                interval: 200,
            },
        });
        tail.on('line', console.log);
    }
    get homebridgeStartupOptionsPath() {
        return path.resolve(this.storagePath, '.uix-hb-service-homebridge-startup.json');
    }
    async loadHomebridgeStartupOptions() {
        try {
            if (await fs.pathExists(this.homebridgeStartupOptionsPath)) {
                const homebridgeStartupOptions = await fs.readJson(this.homebridgeStartupOptionsPath);
                if (homebridgeStartupOptions.debugMode && !this.homebridgeOpts.includes('-D')) {
                    this.homebridgeOpts.push('-D');
                }
                if (this.homebridgePackage && semver.gte(this.homebridgePackage.version, '1.0.2')) {
                    if (homebridgeStartupOptions.keepOrphans && !this.homebridgeOpts.includes('-K')) {
                        this.homebridgeOpts.push('-K');
                    }
                }
                if (homebridgeStartupOptions.insecureMode === false && this.homebridgeOpts.includes('-I')) {
                    this.homebridgeOpts.splice(this.homebridgeOpts.findIndex((x) => x === '-I'), 1);
                    process.env.UIX_INSECURE_MODE = '0';
                }
                Object.assign(this.homebridgeCustomEnv, homebridgeStartupOptions.env);
            }
            else if (this.docker) {
                if (process.env.HOMEBRIDGE_DEBUG === '1' && !this.homebridgeOpts.includes('-D')) {
                    this.homebridgeOpts.push('-D');
                }
                if (process.env.HOMEBRIDGE_INSECURE !== '1' && this.homebridgeOpts.includes('-I')) {
                    this.homebridgeOpts.splice(this.homebridgeOpts.findIndex((x) => x === '-I'), 1);
                    process.env.UIX_INSECURE_MODE = '0';
                }
            }
        }
        catch (e) {
            this.logger(`Failed to load startup options ${e.message}`);
        }
    }
    fixDockerPermissions() {
        try {
            child_process.execSync(`chown -R ${this.uid}:${this.gid} "${this.storagePath}"`);
        }
        catch (e) {
        }
    }
    async checkForNodejsUpdates(requestedVersion) {
        const versionList = (await axios_1.default.get('https://nodejs.org/dist/index.json')).data;
        const currentLts = versionList.filter(x => x.lts)[0];
        if (requestedVersion) {
            const wantedVersion = versionList.find(x => x.version.startsWith('v' + requestedVersion));
            if (wantedVersion) {
                if (!semver.gte(wantedVersion.version, '14.15.0')) {
                    this.logger('Refusing to install Node.js version lower than v14.15.0.', 'fail');
                    return { update: false };
                }
                this.logger(`Installing Node.js ${wantedVersion.version} over ${process.version}...`, 'info');
                return this.installer.updateNodejs({
                    target: wantedVersion.version,
                    rebuild: wantedVersion.modules !== process.versions.modules,
                });
            }
            else {
                this.logger(`v${requestedVersion} is not a valid Node.js version.`, 'info');
                return { update: false };
            }
        }
        if (semver.gt(currentLts.version, process.version)) {
            this.logger(`Updating Node.js from ${process.version} to ${currentLts.version}...`, 'info');
            return this.installer.updateNodejs({
                target: currentLts.version,
                rebuild: currentLts.modules !== process.versions.modules,
            });
        }
        const currentMajor = semver.parse(process.version).major;
        const latestVersion = versionList.filter(x => semver.parse(x.version).major === currentMajor)[0];
        if (semver.gt(latestVersion.version, process.version)) {
            this.logger(`Updating Node.js from ${process.version} to ${latestVersion.version}...`, 'info');
            return this.installer.updateNodejs({
                target: latestVersion.version,
                rebuild: latestVersion.modules !== process.versions.modules,
            });
        }
        this.logger(`Node.js ${process.version} already up-to-date.`);
        return { update: false };
    }
    async downloadNodejs(downloadUrl) {
        const spinner = ora(`Downloading ${downloadUrl}`).start();
        try {
            const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'node'));
            const tempFilePath = path.join(tempDir, 'node.tar.gz');
            const tempFile = fs.createWriteStream(tempFilePath);
            await axios_1.default.get(downloadUrl, { responseType: 'stream' })
                .then((response) => {
                return new Promise((resolve, reject) => {
                    response.data.pipe(tempFile)
                        .on('finish', () => {
                        return resolve(tempFile);
                    })
                        .on('error', (err) => {
                        return reject(err);
                    });
                });
            });
            spinner.succeed('Download complete.');
            return tempFilePath;
        }
        catch (e) {
            spinner.fail(e.message);
            process.exit(1);
        }
    }
    async extractNodejs(targetVersion, extractConfig) {
        const spinner = ora(`Installing Node.js ${targetVersion}`).start();
        try {
            await tar.x(extractConfig);
            spinner.succeed(`Installed Node.js ${targetVersion}`);
        }
        catch (e) {
            spinner.fail(e.message);
            process.exit(1);
        }
    }
    async removeNpmPackage(npmInstallPath) {
        if (!await fs.pathExists(npmInstallPath)) {
            return;
        }
        const spinner = ora(`Cleaning up npm at ${npmInstallPath}...`).start();
        try {
            await fs.remove(npmInstallPath);
            spinner.succeed(`Cleaned up npm at at ${npmInstallPath}`);
        }
        catch (e) {
            spinner.fail(e.message);
        }
    }
    async checkStatus() {
        this.logger(`Testing hb-service is running on port ${this.uiPort}...`);
        try {
            const res = await axios_1.default.get(`http://localhost:${this.uiPort}/api`);
            if (res.data === 'Hello World!') {
                this.logger('Homebridge UI Running', 'succeed');
            }
            else {
                this.logger('Unexpected Response', 'fail');
                process.exit(1);
            }
        }
        catch (e) {
            this.logger('Homebridge UI Not Running', 'fail');
            process.exit(1);
        }
    }
    parseNpmPackageString(input) {
        const RE_SCOPED = /^(@[^\/]+\/[^@\/]+)(?:@([^\/]+))?(\/.*)?$/;
        const RE_NON_SCOPED = /^([^@\/]+)(?:@([^\/]+))?(\/.*)?$/;
        const m = RE_SCOPED.exec(input) || RE_NON_SCOPED.exec(input);
        if (!m) {
            this.logger('Invalid plugin name.', 'fail');
            process.exit(1);
        }
        return {
            name: m[1] || '',
            version: m[2] || 'latest',
            path: m[3] || '',
        };
    }
    async npmPluginManagement(args) {
        if (!this.enableHbServicePluginManagement) {
            this.logger('Plugin management is not supported on your platform using hb-service.', 'fail');
            process.exit(1);
        }
        if (args.length === 1) {
            this.logger('Plugin name required.', 'fail');
            process.exit(1);
        }
        const action = args[0];
        const target = this.parseNpmPackageString(args[args.length - 1]);
        if (!target.name) {
            this.logger('Invalid plugin name.', 'fail');
            process.exit(1);
        }
        if (!target.name.match(/^((@[\w-]*)\/)?(homebridge-[\w-]*)$/)) {
            this.logger('Invalid plugin name.', 'fail');
            process.exit(1);
        }
        const cwd = path.dirname(process.env.UIX_CUSTOM_PLUGIN_PATH);
        if (!await fs.pathExists(cwd)) {
            this.logger(`Path does not exist: "${cwd}"`, 'fail');
        }
        let cmd;
        if (process.env.UIX_USE_PNPM === '1') {
            cmd = `pnpm -C "${cwd}" ${action} ${target.name}`;
        }
        else {
            cmd = `npm --prefix "${cwd}" ${action} ${target.name}`;
        }
        if (action === 'add') {
            cmd += `@${target.version}`;
        }
        this.logger(`CMD: ${cmd}`, 'info');
        try {
            child_process.execSync(cmd, {
                cwd: cwd,
                stdio: 'inherit',
            });
            this.logger(`Installed ${target.name}@${target.version}`, 'succeed');
        }
        catch (e) {
            this.logger('Plugin installation failed.', 'fail');
        }
    }
}
exports.HomebridgeServiceHelper = HomebridgeServiceHelper;
function bootstrap() {
    return new HomebridgeServiceHelper();
}
bootstrap();
//# sourceMappingURL=hb-service.js.map