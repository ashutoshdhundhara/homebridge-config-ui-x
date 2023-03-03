"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaFilter = void 0;
const path = require("path");
const fs = require("fs-extra");
const common_1 = require("@nestjs/common");
let SpaFilter = class SpaFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();
        if (req.url.startsWith('/api/') || req.url.startsWith('/socket.io') || req.url.startsWith('/assets')) {
            return res.code(404).send('Not Found');
        }
        const file = fs.readFileSync(path.resolve(process.env.UIX_BASE_PATH, 'public/index.html'), 'utf-8');
        res.type('text/html');
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', '0');
        res.send(file);
    }
};
SpaFilter = __decorate([
    (0, common_1.Catch)(common_1.NotFoundException)
], SpaFilter);
exports.SpaFilter = SpaFilter;
//# sourceMappingURL=spa.filter.js.map