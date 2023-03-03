"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStartupConfig = void 0;
const os = require("os");
const path = require("path");
const fs = require("fs-extra");
const logger_service_1 = require("../logger/logger.service");
async function getStartupConfig() {
    const logger = new logger_service_1.Logger();
    const configPath = process.env.UIX_CONFIG_PATH || path.resolve(os.homedir(), '.homebridge/config.json');
    const homebridgeConfig = await fs.readJSON(configPath);
    const ui = Array.isArray(homebridgeConfig.platforms) ? homebridgeConfig.platforms.find(x => x.platform === 'config') : undefined;
    const config = {};
    const ipv6 = Object.entries(os.networkInterfaces()).filter(([net, addresses]) => {
        return addresses.find(x => x.family === 'IPv6');
    }).length;
    config.host = ipv6 ? '::' : '0.0.0.0';
    if (!ui) {
        return config;
    }
    if (ui.host) {
        config.host = ui.host;
    }
    if (ui.ssl && ((ui.ssl.key && ui.ssl.cert) || ui.ssl.pfx)) {
        for (const attribute of ['key', 'cert', 'pfx']) {
            if (ui.ssl[attribute]) {
                if (!(await (fs.stat(ui.ssl[attribute]))).isFile()) {
                    logger.error(`SSL Config Error: ui.ssl.${attribute}: ${ui.ssl[attribute]} is not a valid file`);
                }
            }
        }
        try {
            config.httpsOptions = {
                key: ui.ssl.key ? await fs.readFile(ui.ssl.key) : undefined,
                cert: ui.ssl.cert ? await fs.readFile(ui.ssl.cert) : undefined,
                pfx: ui.ssl.pfx ? await fs.readFile(ui.ssl.pfx) : undefined,
                passphrase: ui.ssl.passphrase,
            };
        }
        catch (e) {
            logger.error('WARNING: COULD NOT START SERVER WITH SSL ENABLED');
            logger.error(e);
        }
    }
    if (ui.proxyHost) {
        config.cspWsOveride = `wss://${ui.proxyHost} ws://${ui.proxyHost}`;
    }
    if (ui.debug) {
        config.debug = true;
        process.env.UIX_DEBUG_LOGGING = '1';
    }
    else {
        config.debug = false;
        process.env.UIX_DEBUG_LOGGING = '0';
    }
    return config;
}
exports.getStartupConfig = getStartupConfig;
//# sourceMappingURL=config.startup.js.map