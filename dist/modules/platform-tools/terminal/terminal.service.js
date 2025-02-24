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
exports.TerminalService = void 0;
const fs = require("fs-extra");
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../../core/config/config.service");
const logger_service_1 = require("../../../core/logger/logger.service");
const node_pty_service_1 = require("../../../core/node-pty/node-pty.service");
let TerminalService = class TerminalService {
    constructor(configService, logger, nodePtyService) {
        this.configService = configService;
        this.logger = logger;
        this.nodePtyService = nodePtyService;
        this.ending = false;
    }
    async startSession(client, size) {
        this.ending = false;
        if (!this.configService.enableTerminalAccess) {
            this.logger.error('Terminal is not enabled. Disconnecting client...');
            client.disconnect();
            return;
        }
        this.logger.log('Starting terminal session');
        const shell = await fs.pathExists('/bin/bash') ? '/bin/bash' : '/bin/sh';
        const term = this.nodePtyService.spawn(shell, [], {
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
                    client.emit('process-exit', code);
                }
            }
            catch (e) {
            }
        });
        client.on('stdin', (data) => {
            term.write(data);
        });
        client.on('resize', (resize) => {
            try {
                term.resize(resize.cols, resize.rows);
            }
            catch (e) { }
        });
        const onEnd = () => {
            this.ending = true;
            client.removeAllListeners('stdin');
            client.removeAllListeners('resize');
            client.removeAllListeners('end');
            client.removeAllListeners('disconnect');
            try {
                this.logger.log('Terminal session ended.');
                term.kill();
            }
            catch (e) { }
        };
        client.on('end', onEnd.bind(this));
        client.on('disconnect', onEnd.bind(this));
    }
};
TerminalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        logger_service_1.Logger,
        node_pty_service_1.NodePtyService])
], TerminalService);
exports.TerminalService = TerminalService;
//# sourceMappingURL=terminal.service.js.map