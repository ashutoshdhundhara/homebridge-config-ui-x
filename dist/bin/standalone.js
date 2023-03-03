#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.title = 'homebridge-config-ui-x';
const os = require("os");
const path = require("path");
const commander = require("commander");
commander
    .allowUnknownOption()
    .option('-U, --user-storage-path [path]', '', (p) => process.env.UIX_STORAGE_PATH = p)
    .option('-P, --plugin-path [path]', '', (p) => process.env.UIX_CUSTOM_PLUGIN_PATH = p)
    .option('-I, --insecure', '', () => process.env.UIX_INSECURE_MODE = '1')
    .option('-T, --no-timestamp', '', () => process.env.UIX_LOG_NO_TIMESTAMPS = '1')
    .parse(process.argv);
if (!process.env.UIX_STORAGE_PATH) {
    process.env.UIX_STORAGE_PATH = path.resolve(os.homedir(), '.homebridge');
}
process.env.UIX_CONFIG_PATH = path.resolve(process.env.UIX_STORAGE_PATH, 'config.json');
Promise.resolve().then(() => require('../main'));
//# sourceMappingURL=standalone.js.map