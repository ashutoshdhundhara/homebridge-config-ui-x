"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DarwinInstaller = void 0;
const os = require("os");
const path = require("path");
const child_process = require("child_process");
const fs = require("fs-extra");
const semver = require("semver");
const base_platform_1 = require("../base-platform");
class DarwinInstaller extends base_platform_1.BasePlatform {
    constructor(hbService) {
        super(hbService);
    }
    get plistName() {
        return `com.${this.hbService.serviceName.toLowerCase()}.server`;
    }
    get plistPath() {
        return path.resolve('/Library/LaunchDaemons/', this.plistName + '.plist');
    }
    async install() {
        this.checkForRoot();
        this.fixStoragePath();
        await this.hbService.portCheck();
        await this.checkGlobalNpmAccess();
        await this.hbService.storagePathCheck();
        await this.hbService.configCheck();
        try {
            await this.createLaunchAgent();
            await this.start();
            await this.hbService.printPostInstallInstructions();
        }
        catch (e) {
            console.error(e.toString());
            this.hbService.logger('ERROR: Failed Operation', 'fail');
        }
    }
    async uninstall() {
        this.checkForRoot();
        await this.stop();
        try {
            if (fs.existsSync(this.plistPath)) {
                this.hbService.logger(`Removed ${this.hbService.serviceName} Service`, 'succeed');
                fs.unlinkSync(this.plistPath);
            }
            else {
                this.hbService.logger(`Could not find installed ${this.hbService.serviceName} Service.`, 'fail');
            }
        }
        catch (e) {
            console.error(e.toString());
            this.hbService.logger('ERROR: Failed Operation', 'fail');
        }
    }
    async start() {
        this.checkForRoot();
        try {
            this.hbService.logger(`Starting ${this.hbService.serviceName} Service...`);
            child_process.execSync(`launchctl load -w ${this.plistPath}`);
            this.hbService.logger(`${this.hbService.serviceName} Started`, 'succeed');
        }
        catch (e) {
            this.hbService.logger(`Failed to start ${this.hbService.serviceName}`, 'fail');
        }
    }
    async stop() {
        this.checkForRoot();
        try {
            this.hbService.logger(`Stopping ${this.hbService.serviceName} Service...`);
            child_process.execSync(`launchctl unload -w ${this.plistPath}`);
            this.hbService.logger(`${this.hbService.serviceName} Stopped`, 'succeed');
        }
        catch (e) {
            this.hbService.logger(`Failed to stop ${this.hbService.serviceName}`, 'fail');
        }
    }
    async restart() {
        this.checkForRoot();
        await this.stop();
        setTimeout(async () => {
            await this.start();
        }, 2000);
    }
    async rebuild(all = false) {
        try {
            if (!this.isPackage()) {
                this.checkForRoot();
            }
            const targetNodeVersion = child_process.execSync('node -v').toString('utf8').trim();
            if (this.isPackage() && process.env.UIX_USE_PNPM === '1' && process.env.UIX_CUSTOM_PLUGIN_PATH) {
                const cwd = path.dirname(process.env.UIX_CUSTOM_PLUGIN_PATH);
                if (!await fs.pathExists(cwd)) {
                    this.hbService.logger(`Path does not exist: "${cwd}"`, 'fail');
                    process.exit(1);
                }
                child_process.execSync(`pnpm -C "${cwd}" rebuild`, {
                    cwd: cwd,
                    stdio: 'inherit',
                });
                this.hbService.logger(`Rebuilt plugins in ${process.env.UIX_CUSTOM_PLUGIN_PATH} for Node.js ${targetNodeVersion}.`, 'succeed');
            }
            else {
                const npmGlobalPath = child_process.execSync('/bin/echo -n "$(npm -g prefix)/lib/node_modules"', {
                    env: Object.assign({
                        npm_config_loglevel: 'silent',
                        npm_update_notifier: 'false',
                    }, process.env),
                }).toString('utf8');
                child_process.execSync('npm rebuild --unsafe-perm', {
                    cwd: process.env.UIX_BASE_PATH,
                    stdio: 'inherit',
                });
                this.hbService.logger(`Rebuilt homebridge-config-ui-x for Node.js ${targetNodeVersion}.`, 'succeed');
                if (all === true) {
                    try {
                        child_process.execSync('npm rebuild --unsafe-perm', {
                            cwd: npmGlobalPath,
                            stdio: 'inherit',
                        });
                        this.hbService.logger(`Rebuilt plugins in ${npmGlobalPath} for Node.js ${targetNodeVersion}.`, 'succeed');
                    }
                    catch (e) {
                        this.hbService.logger('Could not rebuild all modules - check Homebridge logs.', 'warn');
                    }
                }
                await this.setNpmPermissions(npmGlobalPath);
            }
        }
        catch (e) {
            console.error(e.toString());
            this.hbService.logger('ERROR: Failed Operation', 'fail');
        }
    }
    async getId() {
        if (process.getuid() === 0 && this.hbService.asUser || process.env.SUDO_USER) {
            const uid = child_process.execSync(`id -u ${this.hbService.asUser || process.env.SUDO_USER}`).toString('utf8');
            const gid = child_process.execSync(`id -g ${this.hbService.asUser || process.env.SUDO_USER}`).toString('utf8');
            return {
                uid: parseInt(uid, 10),
                gid: parseInt(gid, 10),
            };
        }
        else {
            return {
                uid: os.userInfo().uid,
                gid: os.userInfo().gid,
            };
        }
    }
    getPidOfPort(port) {
        try {
            return child_process.execSync(`lsof -n -iTCP:${port} -sTCP:LISTEN -t 2> /dev/null`).toString('utf8').trim();
        }
        catch (e) {
            return null;
        }
    }
    checkForRoot() {
        if (process.getuid() !== 0) {
            this.hbService.logger('ERROR: This command must be executed using sudo on macOS', 'fail');
            this.hbService.logger(`sudo hb-service ${this.hbService.action}`, 'fail');
            process.exit(1);
        }
        if (!process.env.SUDO_USER && !this.hbService.asUser) {
            this.hbService.logger('ERROR: Could not detect user. Pass in the user you want to run Homebridge as using the --user flag eg.', 'fail');
            this.hbService.logger(`sudo hb-service ${this.hbService.action} --user your-user`, 'fail');
            process.exit(1);
        }
        this.user = this.hbService.asUser || process.env.SUDO_USER;
    }
    fixStoragePath() {
        if (!this.hbService.usingCustomStoragePath) {
            this.hbService.storagePath = path.resolve(this.getUserHomeDir(), `.${this.hbService.serviceName.toLowerCase()}`);
        }
    }
    getUserHomeDir() {
        try {
            const realHomeDir = child_process.execSync(`eval echo "~${this.user}"`).toString('utf8').trim();
            if (realHomeDir.charAt(0) === '~') {
                throw new Error('Could not resolve user home directory');
            }
            return realHomeDir;
        }
        catch (e) {
            return os.homedir();
        }
    }
    async updateNodejs(job) {
        this.checkForRoot();
        if (!['x64', 'arm64'].includes(process.arch)) {
            this.hbService.logger(`Architecture not supported: ${process.arch}.`, 'fail');
            process.exit(1);
        }
        if (process.arch === 'arm64' && semver.lt(job.target, '16.0.0')) {
            this.hbService.logger('macOS M1 / arm64 support is only available from Node.js 16 onwards', 'fail');
            process.exit(1);
        }
        if (semver.lt(os.release(), '19.0.0') && semver.gte(job.target, '18.0.0')) {
            this.hbService.logger('macOS Catalina 10.15 or later is required to install Node.js v18 or later', 'fail');
            process.exit(1);
        }
        const downloadUrl = `https://nodejs.org/dist/${job.target}/node-${job.target}-darwin-${process.arch}.tar.gz`;
        const targetPath = path.dirname(path.dirname(process.execPath));
        if (targetPath !== '/usr/local' && !targetPath.startsWith('/Library/Application Support/Homebridge/node-')) {
            this.hbService.logger(`Cannot update Node.js on your system. Non-standard installation path detected: ${targetPath}`, 'fail');
            process.exit(1);
        }
        this.hbService.logger(`Target: ${targetPath}`);
        try {
            const archivePath = await this.hbService.downloadNodejs(downloadUrl);
            const extractConfig = {
                file: archivePath,
                cwd: targetPath,
                strip: 1,
                preserveOwner: false,
                unlink: true,
            };
            await this.hbService.removeNpmPackage(path.resolve(targetPath, 'lib', 'node_modules', 'npm'));
            await this.hbService.extractNodejs(job.target, extractConfig);
            await fs.remove(archivePath);
            await this.rebuild(true);
            if (await fs.pathExists(this.plistPath)) {
                await this.restart();
            }
            else {
                this.hbService.logger('Please restart Homebridge for the changes to take effect.', 'warn');
            }
        }
        catch (e) {
            this.hbService.logger(`Failed to update Node.js: ${e.message}`, 'fail');
            process.exit(1);
        }
    }
    async checkGlobalNpmAccess() {
        const npmGlobalPath = child_process.execSync('/bin/echo -n "$(npm -g prefix)/lib/node_modules"', {
            env: Object.assign({
                npm_config_loglevel: 'silent',
                npm_update_notifier: 'false',
            }, process.env),
        }).toString('utf8');
        const { uid, gid } = await this.getId();
        try {
            child_process.execSync(`test -w "${npmGlobalPath}"`, {
                uid,
                gid,
            });
            child_process.execSync('test -w "$(dirname $(which npm))"', {
                uid,
                gid,
            });
        }
        catch (e) {
            await this.setNpmPermissions(npmGlobalPath);
        }
    }
    async setNpmPermissions(npmGlobalPath) {
        if (this.isPackage()) {
            return;
        }
        try {
            child_process.execSync(`chown -R ${this.user}:admin "${npmGlobalPath}"`);
            child_process.execSync(`chown -R ${this.user}:admin "$(dirname $(which npm))"`);
        }
        catch (e) {
            this.hbService.logger(`ERROR: User "${this.user}" does not have write access to the global npm modules path.`, 'fail');
            this.hbService.logger('You can fix this issue by running the following commands:', 'fail');
            console.log('');
            console.log(`sudo chown -R ${this.user}:admin "${npmGlobalPath}"`);
            console.log(`sudo chown -R ${this.user}:admin "$(dirname $(which npm))"`);
            console.log('');
            this.hbService.logger('Once you have done this run the hb-service install command again to complete your installation.', 'fail');
            process.exit(1);
        }
    }
    isPackage() {
        return (Boolean(process.env.HOMEBRIDGE_MACOS_PACKAGE === '1'));
    }
    async createLaunchAgent() {
        const plistFileContents = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
            '<plist version="1.0">',
            '<dict>',
            '    <key>RunAtLoad</key>',
            '        <true/>',
            '    <key>KeepAlive</key>',
            '        <true/>',
            '    <key>Label</key>',
            `        <string>${this.plistName}</string>`,
            '    <key>ProgramArguments</key>',
            '        <array>',
            `             <string>${process.execPath}</string>`,
            `             <string>${this.hbService.selfPath}</string>`,
            '             <string>run</string>',
            '             <string>-I</string>',
            '             <string>-U</string>',
            `             <string>${this.hbService.storagePath}</string>`,
            '        </array>',
            '    <key>WorkingDirectory</key>',
            `         <string>${this.hbService.storagePath}</string>`,
            '    <key>StandardOutPath</key>',
            `        <string>${this.hbService.storagePath}/homebridge.log</string>`,
            '    <key>StandardErrorPath</key>',
            `        <string>${this.hbService.storagePath}/homebridge.log</string>`,
            '    <key>UserName</key>',
            `        <string>${this.user}</string>`,
            '    <key>EnvironmentVariables</key>',
            '        <dict>',
            '            <key>PATH</key>',
            `                <string>${process.env.PATH}</string>`,
            '            <key>HOME</key>',
            `                <string>${this.getUserHomeDir()}</string>`,
            '            <key>UIX_STORAGE_PATH</key>',
            `                <string>${this.hbService.storagePath}</string>`,
            '        </dict>',
            '</dict>',
            '</plist>',
        ].filter(x => x).join('\n');
        await fs.writeFile(this.plistPath, plistFileContents);
    }
}
exports.DarwinInstaller = DarwinInstaller;
//# sourceMappingURL=darwin.js.map