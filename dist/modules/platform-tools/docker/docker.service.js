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
exports.DockerService = void 0;
const fs = require("fs-extra");
const child_process = require("child_process");
const common_1 = require("@nestjs/common");
const config_service_1 = require("../../../core/config/config.service");
const logger_service_1 = require("../../../core/logger/logger.service");
let DockerService = class DockerService {
    constructor(configService, logger) {
        this.configService = configService;
        this.logger = logger;
    }
    async getStartupScript() {
        const script = await fs.readFile(this.configService.startupScript, 'utf-8');
        return { script };
    }
    async updateStartupScript(script) {
        await fs.writeFile(this.configService.startupScript, script);
        return { script };
    }
    async restartDockerContainer() {
        const cmd = 'sudo kill 1';
        this.logger.log('Restarting the docker container, make sure you have --restart=always turned on or the container will not come back online');
        setTimeout(() => {
            child_process.exec(cmd);
        }, 500);
        return { ok: true, command: cmd };
    }
};
DockerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        logger_service_1.Logger])
], DockerService);
exports.DockerService = DockerService;
//# sourceMappingURL=docker.service.js.map