/// <reference types="node" />
import { EventEmitter } from 'events';
import { PluginsSettingsUiService } from './plugins-settings-ui.service';
export declare class PluginsSettingsUiGateway {
    private pluginSettingsUiService;
    constructor(pluginSettingsUiService: PluginsSettingsUiService);
    startCustomUiHandler(client: EventEmitter, payload: string): Promise<void>;
}
