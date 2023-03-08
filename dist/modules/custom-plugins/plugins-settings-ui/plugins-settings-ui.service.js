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
exports.PluginsSettingsUiService = void 0;
const path = require("path");
const fs = require("fs-extra");
const NodeCache = require("node-cache");
const child_process = require("child_process");
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const logger_service_1 = require("../../../core/logger/logger.service");
const config_service_1 = require("../../../core/config/config.service");
const plugins_service_1 = require("../../plugins/plugins.service");
let PluginsSettingsUiService = class PluginsSettingsUiService {
    constructor(loggerService, pluginsService, configService, httpService) {
        this.loggerService = loggerService;
        this.pluginsService = pluginsService;
        this.configService = configService;
        this.httpService = httpService;
        this.pluginUiMetadataCache = new NodeCache({ stdTTL: 86400 });
        this.pluginUiLastVersionCache = new NodeCache({ stdTTL: 86400 });
    }
    async serveCustomUiAsset(reply, pluginName, assetPath, origin, version) {
        try {
            if (!assetPath) {
                assetPath = 'index.html';
            }
            if (assetPath === 'index.html' && version) {
                if (version !== this.pluginUiLastVersionCache.get(pluginName)) {
                    this.pluginUiMetadataCache.del(pluginName);
                }
            }
            const pluginUi = this.pluginUiMetadataCache.get(pluginName)
                || (await this.getPluginUiMetadata(pluginName));
            const safeSuffix = path.normalize(assetPath).replace(/^(\.\.(\/|\\|$))+/, '');
            const filePath = path.join(pluginUi.publicPath, safeSuffix);
            if (!filePath.startsWith(path.resolve(pluginUi.publicPath))) {
                return reply.code(404).send('Not Found');
            }
            reply.header('Content-Security-Policy', '');
            if (assetPath === 'index.html') {
                return reply
                    .type('text/html')
                    .send(await this.buildIndexHtml(pluginUi, origin));
            }
            if (pluginUi.devServer) {
                return this.serveAssetsFromDevServer(reply, pluginUi, assetPath);
            }
            const fallbackPath = path.resolve(process.env.UIX_BASE_PATH, 'public', path.basename(filePath));
            if (await fs.pathExists(filePath)) {
                return reply.sendFile(path.basename(filePath), path.dirname(filePath));
            }
            else if (fallbackPath.match(/^.*\.(jpe?g|gif|png|svg|ttf|woff2|css)$/i) && await fs.pathExists(fallbackPath)) {
                return reply.sendFile(path.basename(fallbackPath), path.dirname(fallbackPath));
            }
            else {
                this.loggerService.warn('Asset Not Found:', pluginName + '/' + assetPath);
                return reply.code(404).send('Not Found');
            }
        }
        catch (e) {
            e.message === 'Not Found' ? reply.code(404) : reply.code(500);
            this.loggerService.error(`[${pluginName}]`, e.message);
            return reply.send(e.message);
        }
    }
    async getPluginUiMetadata(pluginName) {
        try {
            const pluginUi = await this.pluginsService.getPluginUiMetadata(pluginName);
            this.pluginUiMetadataCache.set(pluginName, pluginUi);
            this.pluginUiLastVersionCache.set(pluginName, pluginUi.plugin.installedVersion);
            return pluginUi;
        }
        catch (e) {
            this.loggerService.warn(`[${pluginName}] Custom UI:`, e.message);
            throw new common_1.NotFoundException();
        }
    }
    async serveAssetsFromDevServer(reply, pluginUi, assetPath) {
        return this.httpService.get(pluginUi.devServer + '/' + assetPath, { responseType: 'text' }).toPromise()
            .then((response) => {
            for (const [key, value] of Object.entries(response.headers)) {
                reply.header(key, value);
            }
            reply.send(response.data);
        })
            .catch(() => {
            return reply.code(404).send('Not Found');
        });
    }
    async getIndexHtmlBody(pluginUi) {
        if (pluginUi.devServer) {
            return (await this.httpService.get(pluginUi.devServer, { responseType: 'text' }).toPromise()).data;
        }
        else {
            return await fs.readFile(path.join(pluginUi.publicPath, 'index.html'), 'utf8');
        }
    }
    async buildIndexHtml(pluginUi, origin) {
        const body = await this.getIndexHtmlBody(pluginUi);
        const htmlDocument = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${pluginUi.plugin.name}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script>
          window._homebridge = {
            plugin: ${JSON.stringify(pluginUi.plugin)},
            serverEnv: ${JSON.stringify(this.configService.uiSettings())},
          };
          </script>
          <script src="${origin || 'http://localhost:4200'}/assets/plugin-ui-utils/ui.js?v=${this.configService.package.version}"></script>
          <script>
            window.addEventListener('load', () => {
              window.parent.postMessage({action: 'loaded'}, '*');
            }, false)
          </script>
        </head>
        <body style="display:none;">
          ${body}
        </body>
      </html>
    `;
        return htmlDocument;
    }
    async startCustomUiHandler(pluginName, client) {
        const pluginUi = this.pluginUiMetadataCache.get(pluginName)
            || (await this.getPluginUiMetadata(pluginName));
        if (!await fs.pathExists(path.resolve(pluginUi.serverPath))) {
            client.emit('ready', { server: false });
            return;
        }
        const childEnv = Object.assign({}, process.env);
        childEnv.HOMEBRIDGE_STORAGE_PATH = this.configService.storagePath;
        childEnv.HOMEBRIDGE_CONFIG_PATH = this.configService.configPath;
        childEnv.HOMEBRIDGE_UI_VERSION = this.configService.package.version;
        const child = child_process.fork(pluginUi.serverPath, [], {
            silent: true,
            env: childEnv,
        });
        child.stdout.on('data', (data) => {
            this.loggerService.log(`[${pluginName}]`, data.toString().trim());
        });
        child.stderr.on('data', (data) => {
            this.loggerService.error(`[${pluginName}]`, data.toString().trim());
        });
        child.on('exit', () => {
            this.loggerService.log(`[${pluginName}]`, 'Child process ended');
        });
        child.addListener('message', (response) => {
            if (typeof response === 'object' && response.action) {
                response.action = response.action === 'error' ? 'server_error' : response.action;
                client.emit(response.action, response.payload);
            }
        });
        const cleanup = () => {
            this.loggerService.log(`[${pluginName}]`, 'Terminating child process...');
            const childPid = child.pid;
            if (child.connected) {
                child.disconnect();
            }
            setTimeout(() => {
                try {
                    process.kill(childPid, 'SIGTERM');
                }
                catch (e) { }
            }, 5000);
            client.removeAllListeners('end');
            client.removeAllListeners('disconnect');
            client.removeAllListeners('request');
        };
        client.on('disconnect', () => {
            cleanup();
        });
        client.on('end', () => {
            cleanup();
        });
        client.on('request', (request) => {
            if (child.connected) {
                child.send(request);
            }
        });
    }
};
PluginsSettingsUiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.Logger,
        plugins_service_1.PluginsService,
        config_service_1.ConfigService,
        axios_1.HttpService])
], PluginsSettingsUiService);
exports.PluginsSettingsUiService = PluginsSettingsUiService;
//# sourceMappingURL=plugins-settings-ui.service.js.map