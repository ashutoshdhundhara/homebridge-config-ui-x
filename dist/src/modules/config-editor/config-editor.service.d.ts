/// <reference types="node" />
import { BadRequestException } from '@nestjs/common';
import { Logger } from '../../core/logger/logger.service';
import { ConfigService, HomebridgeConfig } from '../../core/config/config.service';
import { SchedulerService } from '../../core/scheduler/scheduler.service';
import { PluginsService } from '../plugins/plugins.service';
export declare class ConfigEditorService {
    private readonly logger;
    private readonly configService;
    private readonly schedulerService;
    private readonly pluginsService;
    constructor(logger: Logger, configService: ConfigService, schedulerService: SchedulerService, pluginsService: PluginsService);
    private start;
    private scheduleConfigBackupCleanup;
    getConfigFile(): Promise<HomebridgeConfig>;
    updateConfigFile(config: HomebridgeConfig): Promise<HomebridgeConfig>;
    getConfigForPlugin(pluginName: string): Promise<Record<string, any>[] | BadRequestException>;
    updateConfigForPlugin(pluginName: string, pluginConfig: Record<string, any>[]): Promise<Record<string, any>[] | BadRequestException>;
    disablePlugin(pluginName: string): Promise<string[]>;
    enablePlugin(pluginName: string): Promise<string[]>;
    listConfigBackups(): Promise<{
        id: string;
        timestamp: Date;
        file: string;
    }[]>;
    getConfigBackup(backupId: number): Promise<Buffer>;
    deleteAllConfigBackups(): Promise<void>;
    private ensureBackupPathExists;
    cleanupConfigBackups(): Promise<void>;
    private migrateConfigBackups;
    generatePin(): string;
    generateUsername(): string;
}
