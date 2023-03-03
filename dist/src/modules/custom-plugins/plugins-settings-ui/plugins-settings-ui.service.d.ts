/// <reference types="node" />
import { HttpService } from '@nestjs/axios';
import { Logger } from '../../../core/logger/logger.service';
import { ConfigService } from '../../../core/config/config.service';
import { PluginsService } from '../../plugins/plugins.service';
import { HomebridgePluginUiMetadata } from '../../plugins/types';
import { EventEmitter } from 'events';
export declare class PluginsSettingsUiService {
    private loggerService;
    private pluginsService;
    private configService;
    private httpService;
    private pluginUiMetadataCache;
    private pluginUiLastVersionCache;
    constructor(loggerService: Logger, pluginsService: PluginsService, configService: ConfigService, httpService: HttpService);
    serveCustomUiAsset(reply: any, pluginName: string, assetPath: string, origin: string, version?: string): Promise<any>;
    getPluginUiMetadata(pluginName: string): Promise<HomebridgePluginUiMetadata>;
    serveAssetsFromDevServer(reply: any, pluginUi: HomebridgePluginUiMetadata, assetPath: string): Promise<any>;
    getIndexHtmlBody(pluginUi: HomebridgePluginUiMetadata): Promise<any>;
    buildIndexHtml(pluginUi: HomebridgePluginUiMetadata, origin: string): Promise<string>;
    startCustomUiHandler(pluginName: string, client: EventEmitter): Promise<void>;
}
