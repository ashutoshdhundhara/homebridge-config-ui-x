"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Win32Installer = void 0;
const os = require("os");
const axios_1 = require("axios");
const path = require("path");
const child_process = require("child_process");
const fs = require("fs-extra");
const base_platform_1 = require("../base-platform");
class Win32Installer extends base_platform_1.BasePlatform {
    constructor(hbService) {
        super(hbService);
    }
    async install() {
        this.checkIsAdmin();
        await this.hbService.portCheck();
        await this.hbService.storagePathCheck();
        await this.hbService.configCheck();
        const nssmPath = await this.downloadNssm();
        const installCmd = `"${nssmPath}" install ${this.hbService.serviceName} ` +
            `"${process.execPath}" "\""${this.hbService.selfPath}"\"" run -I -U "\""${this.hbService.storagePath}"\""`;
        const setUserDirCmd = `"${nssmPath}" set ${this.hbService.serviceName} AppEnvironmentExtra ":UIX_STORAGE_PATH=${this.hbService.storagePath}"`;
        try {
            child_process.execSync(installCmd);
            child_process.execSync(setUserDirCmd);
            await this.configureFirewall();
            await this.start();
            await this.hbService.printPostInstallInstructions();
        }
        catch (e) {
            console.error(e.toString());
            this.hbService.logger('ERROR: Failed Operation', 'fail');
        }
    }
    async uninstall() {
        this.checkIsAdmin();
        await this.stop();
        try {
            child_process.execSync(`sc delete ${this.hbService.serviceName}`);
            this.hbService.logger(`Removed ${this.hbService.serviceName} Service`, 'succeed');
        }
        catch (e) {
            console.error(e.toString());
            this.hbService.logger('ERROR: Failed Operation', 'fail');
        }
    }
    async start() {
        this.checkIsAdmin();
        try {
            this.hbService.logger(`Starting ${this.hbService.serviceName} Service...`);
            child_process.execSync(`sc start ${this.hbService.serviceName}`);
            this.hbService.logger(`${this.hbService.serviceName} Started`, 'succeed');
        }
        catch (e) {
            this.hbService.logger(`Failed to start ${this.hbService.serviceName}`, 'fail');
        }
    }
    async stop() {
        this.checkIsAdmin();
        try {
            this.hbService.logger(`Stopping ${this.hbService.serviceName} Service...`);
            child_process.execSync(`sc stop ${this.hbService.serviceName}`);
            this.hbService.logger(`${this.hbService.serviceName} Stopped`, 'succeed');
        }
        catch (e) {
            this.hbService.logger(`Failed to stop ${this.hbService.serviceName}`, 'fail');
        }
    }
    async restart() {
        this.checkIsAdmin();
        await this.stop();
        setTimeout(async () => {
            await this.start();
        }, 4000);
    }
    async rebuild(all = false) {
        this.checkIsAdmin();
        try {
            child_process.execSync('npm rebuild --unsafe-perm', {
                cwd: process.env.UIX_BASE_PATH,
                stdio: 'inherit',
            });
            this.hbService.logger(`Rebuilt modules in ${process.env.UIX_BASE_PATH} for Node.js ${process.version}.`, 'succeed');
        }
        catch (e) {
            console.error(e.toString());
            this.hbService.logger('ERROR: Failed Operation', 'fail');
        }
    }
    async updateNodejs(job) {
        this.hbService.logger('ERROR: This command is not supported on Windows.', 'fail');
        this.hbService.logger(`Please download Node.js v${job.target} from https://nodejs.org/en/download/ and install manually.`, 'fail');
    }
    checkIsAdmin() {
        try {
            child_process.execSync('fsutil dirty query %systemdrive% >nul');
        }
        catch (e) {
            this.hbService.logger('ERROR: This command must be run as an Administrator', 'fail');
            this.hbService.logger('Node.js command prompt shortcut -> Right Click -> Run as administrator', 'fail');
            process.exit(1);
        }
    }
    async downloadNssm() {
        const downloadUrl = `https://github.com/oznu/nssm/releases/download/2.24-101-g897c7ad/nssm_${os.arch()}.exe`;
        const nssmPath = path.resolve(this.hbService.storagePath, 'nssm.exe');
        if (await fs.pathExists(nssmPath)) {
            return nssmPath;
        }
        const nssmFile = fs.createWriteStream(nssmPath);
        this.hbService.logger(`Downloading NSSM from ${downloadUrl}`);
        return new Promise((resolve, reject) => {
            (0, axios_1.default)({
                method: 'GET',
                url: downloadUrl,
                responseType: 'stream',
            }).then((response) => {
                response.data.pipe(nssmFile)
                    .on('finish', () => {
                    return resolve(nssmPath);
                })
                    .on('error', (err) => {
                    return reject(err);
                });
            }).catch(async (e) => {
                nssmFile.close();
                await fs.remove(nssmPath);
                this.hbService.logger(`Failed to download nssm: ${e.message}`, 'fail');
                process.exit(0);
            });
        });
    }
    async configureFirewall() {
        const cleanFirewallCmd = 'netsh advfirewall firewall Delete rule name="Homebridge"';
        const openFirewallCmd = `netsh advfirewall firewall add rule name="Homebridge" dir=in action=allow program="${process.execPath}"`;
        try {
            child_process.execSync(cleanFirewallCmd);
        }
        catch (e) {
        }
        try {
            child_process.execSync(openFirewallCmd);
        }
        catch (e) {
            this.hbService.logger('Failed to configure firewall rule for Homebridge.', 'warn');
            this.hbService.logger(e);
        }
    }
}
exports.Win32Installer = Win32Installer;
//# sourceMappingURL=win32.js.map