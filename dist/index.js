"use strict";
const path = require("path");
const child_process = require("child_process");
const commander = require("commander");
const semver = require("semver");
let homebridge;
class HomebridgeConfigUi {
    constructor(log, config) {
        this.log = log;
        process.env.UIX_CONFIG_PATH = homebridge.user.configPath();
        process.env.UIX_STORAGE_PATH = homebridge.user.storagePath();
        process.env.UIX_PLUGIN_NAME = config.name || 'homebridge-config-ui-x';
        commander
            .allowUnknownOption()
            .option('-P, --plugin-path [path]', '', (p) => process.env.UIX_CUSTOM_PLUGIN_PATH = p)
            .option('-I, --insecure', '', () => process.env.UIX_INSECURE_MODE = '1')
            .option('-T, --no-timestamp', '', () => process.env.UIX_LOG_NO_TIMESTAMPS = '1')
            .parse(process.argv);
        if (!semver.satisfies(process.version, '>=10.17.0')) {
            const msg = `Node.js v10.17.0 higher is required. You may experience issues running this plugin running on ${process.version}.`;
            log.error(msg);
            log.warn(msg);
        }
        if (process.env.UIX_SERVICE_MODE === '1' && process.connected) {
            this.log('Running in Service Mode');
            return;
        }
        else if (config.standalone || process.env.UIX_SERVICE_MODE === '1' ||
            (process.env.HOMEBRIDGE_CONFIG_UI === '1' && semver.satisfies(process.env.CONFIG_UI_VERSION, '>=3.5.5'))) {
            this.log.warn('*********** Homebridge Standalone Mode Is Depreciated **********');
            this.log.warn('* Please swap to "service mode" using the hb-service command.  *');
            this.log.warn('* See https://homebridge.io/w/JUvQr for instructions on how to migrate. *');
            this.log('Running in Standalone Mode.');
        }
        else if (config.noFork) {
            this.noFork();
        }
        else {
            this.fork();
        }
    }
    fork() {
        const ui = child_process.fork(path.resolve(__dirname, 'bin/fork'), null, {
            env: process.env,
        });
        this.log('Spawning homebridge-config-ui-x with PID', ui.pid);
        ui.on('close', () => {
            process.kill(process.pid, 'SIGTERM');
        });
        ui.on('error', (err) => {
        });
    }
    async noFork() {
        await Promise.resolve().then(() => require('./main'));
    }
    static serviceMode() {
        process.on('disconnect', () => {
            process.exit();
        });
    }
    accessories(callback) {
        const accessories = [];
        callback(accessories);
    }
}
module.exports = (api) => {
    homebridge = api;
    homebridge.registerPlatform('homebridge-config-ui-x', 'config', HomebridgeConfigUi);
    if (process.env.UIX_SERVICE_MODE === '1' && process.connected) {
        HomebridgeConfigUi.serviceMode();
    }
};
//# sourceMappingURL=index.js.map