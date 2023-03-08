"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const common_1 = require("@nestjs/common");
const color = require("bash-color");
class Logger extends common_1.ConsoleLogger {
    constructor() {
        super(...arguments);
        this.pluginName = ('Homebridge UI');
        this.useTimestamps = (process.env.UIX_LOG_NO_TIMESTAMPS !== '1');
    }
    get prefix() {
        if (this.useTimestamps) {
            return color.white(`[${new Date().toLocaleString()}] `) + color.cyan(`[${this.pluginName}]`);
        }
        else {
            return color.cyan(`[${this.pluginName}]`);
        }
    }
    log(...args) {
        console.log(this.prefix, ...args);
    }
    error(...args) {
        console.error(this.prefix, ...args.map(x => color.red(x)));
    }
    warn(...args) {
        console.warn(this.prefix, ...args.map(x => color.yellow(x)));
    }
    debug(...args) {
        if (process.env.UIX_DEBUG_LOGGING === '1') {
            console.debug(this.prefix, ...args.map(x => color.green(x)));
        }
    }
    verbose(...args) {
        console.debug(this.prefix, ...args);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.service.js.map