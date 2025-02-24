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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessoriesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const accessories_service_1 = require("./accessories.service");
const accessories_dto_1 = require("./accessories.dto");
let AccessoriesController = class AccessoriesController {
    constructor(accessoriesService) {
        this.accessoriesService = accessoriesService;
    }
    getAccessories() {
        return this.accessoriesService.loadAccessories();
    }
    getAccessoryLayout(req) {
        return this.accessoriesService.getAccessoryLayout(req.user.username);
    }
    getAccessory(uniqueId) {
        return this.accessoriesService.getAccessory(uniqueId);
    }
    setAccessoryCharacteristic(uniqueId, body) {
        return this.accessoriesService.setAccessoryCharacteristic(uniqueId, body.characteristicType, body.value);
    }
};
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Return a list of Homebridge accessories.',
        description: 'Homebridge must be running in "insecure" mode to access the accessory list.',
    }),
    (0, common_1.Get)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccessoriesController.prototype, "getAccessories", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get the accessory and room layout for the authenticating user.',
    }),
    (0, common_1.Get)('/layout'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AccessoriesController.prototype, "getAccessoryLayout", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Get a single accessory and refresh it\'s characteristics.',
        description: 'Get the "uniqueId" from the GET /api/accessories method.',
    }),
    (0, common_1.Get)('/:uniqueId'),
    __param(0, (0, common_1.Param)('uniqueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccessoriesController.prototype, "getAccessory", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Set the value of an accessory characteristic.',
        description: 'Get the "uniqueId" and "characteristicType" values from the GET /api/accessories method.',
    }),
    (0, swagger_1.ApiParam)({ name: 'uniqueId' }),
    (0, common_1.Put)('/:uniqueId'),
    __param(0, (0, common_1.Param)('uniqueId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, accessories_dto_1.AccessorySetCharacteristicDto]),
    __metadata("design:returntype", void 0)
], AccessoriesController.prototype, "setAccessoryCharacteristic", null);
AccessoriesController = __decorate([
    (0, swagger_1.ApiTags)('Accessories'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)()),
    (0, common_1.Controller)('accessories'),
    __metadata("design:paramtypes", [accessories_service_1.AccessoriesService])
], AccessoriesController);
exports.AccessoriesController = AccessoriesController;
//# sourceMappingURL=accessories.controller.js.map