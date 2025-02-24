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
exports.HomebridgeHueController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const admin_guard_1 = require("../../../core/auth/guards/admin.guard");
const homebridge_hue_service_1 = require("./homebridge-hue.service");
let HomebridgeHueController = class HomebridgeHueController {
    constructor(homebridgeHueService) {
        this.homebridgeHueService = homebridgeHueService;
    }
    async exchangeCredentials() {
        return this.homebridgeHueService.streamDumpFile();
    }
};
__decorate([
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    (0, common_1.Get)('/dump-file'),
    (0, common_1.Header)('Content-disposition', 'attachment; filename=homebridge-hue.json.gz'),
    (0, common_1.Header)('Content-Type', 'application/json+gzip'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HomebridgeHueController.prototype, "exchangeCredentials", null);
HomebridgeHueController = __decorate([
    (0, swagger_1.ApiTags)('Plugins'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    (0, common_1.Controller)('plugins/custom-plugins/homebridge-hue'),
    __metadata("design:paramtypes", [homebridge_hue_service_1.HomebridgeHueService])
], HomebridgeHueController);
exports.HomebridgeHueController = HomebridgeHueController;
//# sourceMappingURL=homebridge-hue.controller.js.map