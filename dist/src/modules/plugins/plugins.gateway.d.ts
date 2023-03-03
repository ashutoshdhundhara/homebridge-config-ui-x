/// <reference types="node" />
import { EventEmitter } from 'events';
import { WsException } from '@nestjs/websockets';
import { PluginsService } from './plugins.service';
import { PluginActionDto, HomebridgeUpdateActionDto } from './plugins.dto';
import { Logger } from '../../core/logger/logger.service';
export declare class PluginsGateway {
    private pluginsService;
    private logger;
    constructor(pluginsService: PluginsService, logger: Logger);
    installPlugin(client: EventEmitter, pluginAction: PluginActionDto): Promise<boolean | WsException>;
    uninstallPlugin(client: EventEmitter, pluginAction: PluginActionDto): Promise<boolean | WsException>;
    updatePlugin(client: EventEmitter, pluginAction: PluginActionDto): Promise<boolean | WsException>;
    homebridgeUpdate(client: EventEmitter, homebridgeUpdateAction: HomebridgeUpdateActionDto): Promise<boolean | WsException>;
}
