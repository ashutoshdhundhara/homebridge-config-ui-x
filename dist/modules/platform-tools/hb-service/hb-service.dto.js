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
exports.HbServiceStartupSettings = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class HbServiceStartupSettings {
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({ default: false, required: true }),
    __metadata("design:type", Boolean)
], HbServiceStartupSettings.prototype, "HOMEBRIDGE_DEBUG", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({ default: false, required: true }),
    __metadata("design:type", Boolean)
], HbServiceStartupSettings.prototype, "HOMEBRIDGE_KEEP_ORPHANS", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({ default: true, required: true }),
    __metadata("design:type", Boolean)
], HbServiceStartupSettings.prototype, "HOMEBRIDGE_INSECURE", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], HbServiceStartupSettings.prototype, "ENV_DEBUG", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], HbServiceStartupSettings.prototype, "ENV_NODE_OPTIONS", void 0);
exports.HbServiceStartupSettings = HbServiceStartupSettings;
//# sourceMappingURL=hb-service.dto.js.map