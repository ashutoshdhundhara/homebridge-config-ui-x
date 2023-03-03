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
exports.UserDeactivateOtpDto = exports.UserActivateOtpDto = exports.UserUpdatePasswordDto = exports.UserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UserDto {
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({ readOnly: true }),
    __metadata("design:type", Number)
], UserDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDefined)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDefined)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserDto.prototype, "admin", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({ writeOnly: true }),
    __metadata("design:type", String)
], UserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.Equals)(undefined),
    __metadata("design:type", String)
], UserDto.prototype, "hashedPassword", void 0);
__decorate([
    (0, class_validator_1.Equals)(undefined),
    __metadata("design:type", String)
], UserDto.prototype, "salt", void 0);
__decorate([
    (0, class_validator_1.Equals)(undefined),
    __metadata("design:type", String)
], UserDto.prototype, "otpSecret", void 0);
__decorate([
    (0, class_validator_1.Equals)(undefined),
    (0, swagger_1.ApiProperty)({ readOnly: true }),
    __metadata("design:type", Boolean)
], UserDto.prototype, "otpActive", void 0);
exports.UserDto = UserDto;
class UserUpdatePasswordDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserUpdatePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserUpdatePasswordDto.prototype, "newPassword", void 0);
exports.UserUpdatePasswordDto = UserUpdatePasswordDto;
class UserActivateOtpDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserActivateOtpDto.prototype, "code", void 0);
exports.UserActivateOtpDto = UserActivateOtpDto;
class UserDeactivateOtpDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserDeactivateOtpDto.prototype, "password", void 0);
exports.UserDeactivateOtpDto = UserDeactivateOtpDto;
//# sourceMappingURL=users.dto.js.map