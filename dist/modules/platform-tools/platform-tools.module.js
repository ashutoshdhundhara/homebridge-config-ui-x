"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformToolsModule = void 0;
const common_1 = require("@nestjs/common");
const linux_module_1 = require("./linux/linux.module");
const docker_module_1 = require("./docker/docker.module");
const terminal_module_1 = require("./terminal/terminal.module");
const hb_service_module_1 = require("./hb-service/hb-service.module");
let PlatformToolsModule = class PlatformToolsModule {
};
PlatformToolsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            terminal_module_1.TerminalModule,
            linux_module_1.LinuxModule,
            docker_module_1.DockerModule,
            hb_service_module_1.HbServiceModule,
        ],
    })
], PlatformToolsModule);
exports.PlatformToolsModule = PlatformToolsModule;
//# sourceMappingURL=platform-tools.module.js.map