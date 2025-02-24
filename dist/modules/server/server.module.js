"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const config_module_1 = require("../../core/config/config.module");
const logger_module_1 = require("../../core/logger/logger.module");
const homebridge_ipc_module_1 = require("../../core/homebridge-ipc/homebridge-ipc.module");
const config_editor_module_1 = require("../config-editor/config-editor.module");
const child_bridges_module_1 = require("../child-bridges/child-bridges.module");
const accessories_module_1 = require("../accessories/accessories.module");
const server_service_1 = require("./server.service");
const server_controller_1 = require("./server.controller");
let ServerModule = class ServerModule {
};
ServerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            config_module_1.ConfigModule,
            logger_module_1.LoggerModule,
            config_editor_module_1.ConfigEditorModule,
            accessories_module_1.AccessoriesModule,
            child_bridges_module_1.ChildBridgesModule,
            homebridge_ipc_module_1.HomebridgeIpcModule,
        ],
        providers: [
            server_service_1.ServerService,
        ],
        controllers: [
            server_controller_1.ServerController,
        ],
        exports: [
            server_service_1.ServerService,
        ]
    })
], ServerModule);
exports.ServerModule = ServerModule;
//# sourceMappingURL=server.module.js.map