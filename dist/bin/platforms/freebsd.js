"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeBSDInstaller = void 0;
const os = require("os");
const path = require("path");
const child_process = require("child_process");
const fs = require("fs-extra");
const base_platform_1 = require("../base-platform");
class FreeBSDInstaller extends base_platform_1.BasePlatform {
    constructor(hbService) {
        super(hbService);
    }
    get rcServiceName() {
        return this.hbService.serviceName.toLowerCase();
    }
    get rcServicePath() {
        return path.resolve('/usr/local/etc/rc.d', this.rcServiceName);
    }
    async install() {
        this.checkForRoot();
        await this.checkUser();
        this.setupSudo();
        await this.hbService.portCheck();
        await this.hbService.storagePathCheck();
        await this.hbService.configCheck();
        try {
            await this.createRCService();
            await this.enableService();
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
        await this.disableService();
        try {
            if (fs.existsSync(this.rcServicePath)) {
                this.hbService.logger(`Removed ${this.rcServiceName} Service`, 'succeed');
                fs.unlinkSync(this.rcServicePath);
            }
            else {
                this.hbService.logger(`Could not find installed ${this.rcServiceName} Service.`, 'fail');
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
            this.hbService.logger(`Starting ${this.rcServiceName} Service...`);
            child_process.execSync(`service ${this.rcServiceName} start`, { stdio: 'inherit' });
            this.hbService.logger(`${this.rcServiceName} Started`, 'succeed');
        }
        catch (e) {
            this.hbService.logger(`Failed to start ${this.rcServiceName}`, 'fail');
        }
    }
    async stop() {
        this.checkForRoot();
        try {
            this.hbService.logger(`Stopping ${this.rcServiceName} Service...`);
            child_process.execSync(`service ${this.rcServiceName} stop`, { stdio: 'inherit' });
            this.hbService.logger(`${this.rcServiceName} Stopped`, 'succeed');
        }
        catch (e) {
            this.hbService.logger(`Failed to stop ${this.rcServiceName}`, 'fail');
        }
    }
    async restart() {
        this.checkForRoot();
        try {
            this.hbService.logger(`Restarting ${this.rcServiceName} Service...`);
            child_process.execSync(`service ${this.rcServiceName} restart`, { stdio: 'inherit' });
            this.hbService.logger(`${this.rcServiceName} Restarted`, 'succeed');
        }
        catch (e) {
            this.hbService.logger(`Failed to restart ${this.rcServiceName}`, 'fail');
        }
    }
    async rebuild(all = false) {
        try {
            this.checkForRoot();
            const npmGlobalPath = child_process.execSync('/bin/echo -n "$(npm -g prefix)/lib/node_modules"', {
                env: Object.assign({
                    npm_config_loglevel: 'silent',
                    npm_update_notifier: 'false',
                }, process.env),
            }).toString('utf8');
            const targetNodeVersion = child_process.execSync('node -v').toString('utf8').trim();
            child_process.execSync('npm rebuild --unsafe-perm', {
                cwd: process.env.UIX_BASE_PATH,
                stdio: 'inherit',
            });
            if (all === true) {
                try {
                    child_process.execSync('npm rebuild --unsafe-perm', {
                        cwd: npmGlobalPath,
                        stdio: 'inherit',
                    });
                }
                catch (e) {
                    this.hbService.logger('Could not rebuild all modules - check Homebridge logs.', 'warn');
                }
            }
            this.hbService.logger(`Rebuilt modules in ${process.env.UIX_BASE_PATH} for Node.js ${targetNodeVersion}.`, 'succeed');
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
            return child_process.execSync(`sockstat -P tcp -p ${port} -l -q 2> /dev/null | awk '{print $3}' | head -n 1`).toString('utf8').trim();
        }
        catch (e) {
            return null;
        }
    }
    async enableService() {
        try {
            child_process.execSync(`sysrc ${this.rcServiceName}_enable="YES" 2> /dev/null`);
        }
        catch (e) {
            this.hbService.logger(`WARNING: failed to run "sysrc ${this.rcServiceName}_enable=\"YES\"`, 'warn');
        }
    }
    async disableService() {
        try {
            child_process.execSync(`sysrc ${this.rcServiceName}_enable="NO" 2> /dev/null`);
        }
        catch (e) {
            this.hbService.logger(`WARNING: failed to run "sysrc ${this.rcServiceName}_enable=\"NO\"`, 'warn');
        }
    }
    checkForRoot() {
        if (process.getuid() !== 0) {
            this.hbService.logger('ERROR: This command must be executed using sudo on FreeBSD', 'fail');
            this.hbService.logger(`EXAMPLE: sudo hb-service ${this.hbService.action}`, 'fail');
            process.exit(1);
        }
        if (this.hbService.action === 'install' && !process.env.SUDO_USER && !this.hbService.asUser) {
            this.hbService.logger('ERROR: Could not detect user. Pass in the user you want to run Homebridge as using the --user flag eg.', 'fail');
            this.hbService.logger(`EXAMPLE: sudo hb-service ${this.hbService.action} --user your-user`, 'fail');
            process.exit(1);
        }
    }
    async checkUser() {
        try {
            child_process.execSync(`id ${this.hbService.asUser} 2> /dev/null`);
        }
        catch (e) {
            child_process.execSync(`pw useradd -q -n ${this.hbService.asUser} -s /usr/sbin/nologin 2> /dev/null`);
            this.hbService.logger(`Created service user: ${this.hbService.asUser}`, 'info');
        }
    }
    setupSudo() {
        try {
            const npmPath = child_process.execSync('which npm').toString('utf8').trim();
            const sudoersEntry = `${this.hbService.asUser}    ALL=(ALL) NOPASSWD:SETENV: ${npmPath}, /usr/local/bin/npm`;
            const sudoers = fs.readFileSync('/usr/local/etc/sudoers', 'utf-8');
            if (sudoers.includes(sudoersEntry)) {
                return;
            }
            child_process.execSync(`echo '${sudoersEntry}' | sudo EDITOR='tee -a' visudo`);
        }
        catch (e) {
            this.hbService.logger('WARNING: Failed to setup /etc/sudoers, you may not be able to shutdown/restart your server from the Homebridge UI.', 'warn');
        }
    }
    async updateNodejs(job) {
        this.hbService.logger('Update Node.js using pkg manually.', 'fail');
        process.exit(1);
    }
    async createRCService() {
        const rcFileContents = [
            '#!/bin/sh',
            '#',
            '# PROVIDE: ' + this.rcServiceName,
            '# REQUIRE: NETWORKING SYSLOG',
            '# KEYWORD: shutdown',
            '#',
            '# Add the following lines to /etc/rc.conf to enable ' + this.rcServiceName + ':',
            '#',
            '#' + this.rcServiceName + '_enable="YES"',
            '',
            '. /etc/rc.subr',
            '',
            'name="' + this.rcServiceName + '"',
            'rcvar="' + this.rcServiceName + '_enable"',
            '',
            'load_rc_config $name',
            '',
            ': ${' + this.rcServiceName + '_user:="' + this.hbService.asUser + '"}',
            ': ${' + this.rcServiceName + '_enable:="NO"}',
            ': ${' + this.rcServiceName + '_facility:="daemon"}',
            ': ${' + this.rcServiceName + '_priority:="debug"}',
            ': ${' + this.rcServiceName + '_storage_path:="' + this.hbService.storagePath + '"}',
            '',
            'export HOME="$(eval echo ~${homebridge_user})"',
            'export PATH=/usr/local/bin:${PATH}',
            'export HOMEBRIDGE_CONFIG_UI_TERMINAL=1',
            'export UIX_STORAGE_PATH="${homebridge_storage_path}"',
            '',
            'pidfile="/var/run/${name}.pid"',
            'command="/usr/sbin/daemon"',
            'procname="daemon"',
            'command_args=" -c -f -R 3 -P ${pidfile} ' + this.hbService.selfPath + ' run -U ${homebridge_storage_path}"',
            'start_precmd="homebridge_precmd"',
            '',
            'homebridge_precmd()',
            '{',
            '   sleep 10',
            '   chown -R ${homebridge_user}: ${homebridge_storage_path}',
            '   install -o ${homebridge_user} /dev/null ${pidfile}',
            '}',
            '',
            'run_rc_command "$1"',
        ].filter(x => x).join('\n');
        await fs.outputFile(this.rcServicePath, rcFileContents);
        await fs.chmod(this.rcServicePath, '755');
    }
}
exports.FreeBSDInstaller = FreeBSDInstaller;
//# sourceMappingURL=freebsd.js.map