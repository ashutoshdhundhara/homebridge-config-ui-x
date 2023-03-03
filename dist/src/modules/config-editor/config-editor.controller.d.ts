/// <reference types="node" />
import { ConfigEditorService } from './config-editor.service';
export declare class ConfigEditorController {
    private configEditorService;
    constructor(configEditorService: ConfigEditorService);
    getConfig(): Promise<import("../../core/config/config.service").HomebridgeConfig>;
    updateConfig(body: any): Promise<import("../../core/config/config.service").HomebridgeConfig>;
    getConfigForPlugin(pluginName: string): Promise<Record<string, any>[] | import("@nestjs/common").BadRequestException>;
    updateConfigForPlugin(pluginName: string, body: any): Promise<Record<string, any>[] | import("@nestjs/common").BadRequestException>;
    disablePlugin(pluginName: any): Promise<string[]>;
    enablePlugin(pluginName: any): Promise<string[]>;
    listConfigBackups(): Promise<{
        id: string;
        timestamp: Date;
        file: string;
    }[]>;
    getBackup(backupId: any): Promise<Buffer>;
    deleteAllConfigBackups(): Promise<void>;
}
