"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePlatform = void 0;
class BasePlatform {
    constructor(hbService) {
        this.hbService = hbService;
    }
    async install() {
        this.hbService.logger('This command has not been implemented on this platform.', 'fail');
        process.exit(0);
    }
    async uninstall() {
        this.hbService.logger('This command has not been implemented on this platform.', 'fail');
        process.exit(0);
    }
    async start() {
        this.hbService.logger('This command has not been implemented on this platform.', 'fail');
        process.exit(0);
    }
    async stop() {
        this.hbService.logger('This command has not been implemented on this platform.', 'fail');
        process.exit(0);
    }
    async restart() {
        this.hbService.logger('This command has not been implemented on this platform.', 'fail');
        process.exit(0);
    }
    async beforeStart() {
        this.hbService.logger('This command has not been implemented on this platform.', 'fail');
        process.exit(0);
    }
    async rebuild(all = false) {
        this.hbService.logger('This command has not been implemented on this platform.', 'fail');
        process.exit(0);
    }
    async getId() {
        return {
            uid: 0,
            gid: 0,
        };
    }
    getPidOfPort(port) {
        return null;
    }
    async updateNodejs(job) {
        return;
    }
}
exports.BasePlatform = BasePlatform;
//# sourceMappingURL=base-platform.js.map