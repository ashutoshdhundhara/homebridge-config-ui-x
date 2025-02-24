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
exports.LogService = void 0;
const os = require("os");
const color = require("bash-color");
const semver = require("semver");
const child_process = require("child_process");
const fs = require("fs-extra");
const common_1 = require("@nestjs/common");
const tail_1 = require("tail");
const config_service_1 = require("../../core/config/config.service");
const node_pty_service_1 = require("../../core/node-pty/node-pty.service");
let LogService = class LogService {
    constructor(configService, nodePtyService) {
        this.configService = configService;
        this.nodePtyService = nodePtyService;
        this.useNative = false;
        this.ending = false;
        this.setLogMethod();
    }
    setLogMethod() {
        this.useNative = false;
        if (typeof this.configService.ui.log !== 'object') {
            this.logNotConfigured();
        }
        else if (this.configService.ui.log.method === 'file' && this.configService.ui.log.path) {
            this.logFromFile();
        }
        else if (this.configService.ui.log.method === 'native' && this.configService.ui.log.path) {
            this.useNative = true;
            this.command = undefined;
        }
        else if (this.configService.ui.log.method === 'systemd') {
            this.logFromSystemd();
        }
        else if (this.configService.ui.log.method === 'custom' && this.configService.ui.log.command) {
            this.logFromCommand();
        }
        else {
            this.logNotConfigured();
        }
    }
    connect(client, size) {
        this.ending = false;
        if (!semver.satisfies(process.version, `>=${this.configService.minimumNodeVersion}`)) {
            client.emit('stdout', color.yellow(`Node.js v${this.configService.minimumNodeVersion} higher is required for ${this.configService.name}.\n\r`));
            client.emit('stdout', color.yellow(`You may experience issues while running on Node.js ${process.version}.\n\r\n\r`));
        }
        if (this.command) {
            client.emit('stdout', color.cyan(`Loading logs using "${this.configService.ui.log.method}" method...\r\n`));
            client.emit('stdout', color.cyan(`CMD: ${this.command.join(' ')}\r\n\r\n`));
            this.tailLog(client, size);
        }
        else if (this.useNative) {
            client.emit('stdout', color.cyan('Loading logs using native method...\r\n'));
            client.emit('stdout', color.cyan(`File: ${this.configService.ui.log.path}\r\n\r\n`));
            this.tailLogFromFileNative(client);
        }
        else {
            client.emit('stdout', color.red('Cannot show logs. "log" option is not configured correctly in your Homebridge config.json file.\r\n\r\n'));
            client.emit('stdout', color.cyan('See https://homebridge.io/w/JtHrm for instructions or use hb-service.\r\n'));
        }
    }
    tailLog(client, size) {
        const command = [...this.command];
        const term = this.nodePtyService.spawn(command.shift(), command, {
            name: 'xterm-color',
            cols: size.cols,
            rows: size.rows,
            cwd: this.configService.storagePath,
            env: process.env,
        });
        term.onData((data) => {
            client.emit('stdout', data);
        });
        term.onExit((code) => {
            try {
                if (!this.ending) {
                    client.emit('stdout', '\n\r');
                    client.emit('stdout', color.red(`The log tail command "${command.join(' ')}" exited with code ${code.exitCode}.\n\r`));
                    client.emit('stdout', color.red('Please check the command in your config.json is correct.\n\r\n\r'));
                    client.emit('stdout', color.cyan('See https://github.com/oznu/homebridge-config-ui-x#log-viewer-configuration for instructions.\r\n'));
                }
            }
            catch (e) {
            }
        });
        client.on('resize', (resize) => {
            try {
                term.resize(resize.cols, resize.rows);
            }
            catch (e) { }
        });
        const onEnd = () => {
            this.ending = true;
            client.removeAllListeners('resize');
            client.removeAllListeners('end');
            client.removeAllListeners('disconnect');
            try {
                term.kill();
            }
            catch (e) { }
            if (this.configService.ui.sudo && term && term.pid) {
                child_process.exec(`sudo -n kill -9 ${term.pid}`);
            }
        };
        client.on('end', onEnd.bind(this));
        client.on('disconnect', onEnd.bind(this));
    }
    logFromFile() {
        let command;
        if (os.platform() === 'win32') {
            command = ['powershell.exe', '-command', `Get-Content -Path '${this.configService.ui.log.path}' -Wait -Tail 200`];
        }
        else {
            command = ['tail', '-n', '500', '-f', this.configService.ui.log.path];
            if (this.configService.ui.sudo) {
                command.unshift('sudo', '-n');
            }
        }
        this.command = command;
    }
    logFromSystemd() {
        const command = ['journalctl', '-o', 'cat', '-n', '500', '-f', '-u', this.configService.ui.log.service || 'homebridge'];
        if (this.configService.ui.sudo) {
            command.unshift('sudo', '-n');
        }
        this.command = command;
    }
    async tailLogFromFileNative(client) {
        if (!fs.existsSync(this.configService.ui.log.path)) {
            client.emit('stdout', '\n\r');
            client.emit('stdout', color.red(`No log file exists at path: ${this.configService.ui.log.path}\n\r`));
        }
        try {
            const logStats = await fs.stat(this.configService.ui.log.path);
            const logStartPosition = logStats.size <= 50000 ? 0 : logStats.size - 50000;
            const logStream = fs.createReadStream(this.configService.ui.log.path, { start: logStartPosition });
            logStream.on('data', (buffer) => {
                client.emit('stdout', buffer.toString('utf8').split('\n').join('\n\r'));
            });
            logStream.on('end', () => {
                logStream.close();
            });
        }
        catch (e) {
            client.emit('stdout', color.red(`Failed to read log file: ${e.message}\n\r`));
            return;
        }
        if (!this.nativeTail) {
            this.nativeTail = new tail_1.Tail(this.configService.ui.log.path, {
                fromBeginning: false,
                useWatchFile: true,
                fsWatchOptions: {
                    interval: 200,
                },
            });
        }
        else if (this.nativeTail.listenerCount('line') === 0) {
            this.nativeTail.watch();
        }
        const onLine = (line) => {
            client.emit('stdout', line + '\n\r');
        };
        const onError = (err) => {
            client.emit('stdout', err.message + '\n\r');
        };
        this.nativeTail.on('line', onLine);
        this.nativeTail.on('error', onError);
        const onEnd = () => {
            this.ending = true;
            this.nativeTail.removeListener('line', onLine);
            this.nativeTail.removeListener('error', onError);
            if (this.nativeTail.listenerCount('line') === 0) {
                this.nativeTail.unwatch();
            }
            client.removeAllListeners('end');
            client.removeAllListeners('disconnect');
        };
        client.on('end', onEnd.bind(this));
        client.on('disconnect', onEnd.bind(this));
    }
    logFromCommand() {
        this.command = this.configService.ui.log.command.split(' ');
    }
    logNotConfigured() {
        this.command = null;
    }
};
LogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        node_pty_service_1.NodePtyService])
], LogService);
exports.LogService = LogService;
//# sourceMappingURL=log.service.js.map