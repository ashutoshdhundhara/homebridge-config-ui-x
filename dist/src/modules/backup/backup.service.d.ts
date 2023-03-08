/// <reference types="node" />
import { EventEmitter } from 'events';
import { StreamableFile } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import { PluginsService } from '../plugins/plugins.service';
import { SchedulerService } from '../../core/scheduler/scheduler.service';
import { ConfigService } from '../../core/config/config.service';
import { HomebridgeIpcService } from '../../core/homebridge-ipc/homebridge-ipc.service';
import { Logger } from '../../core/logger/logger.service';
export declare class BackupService {
    private readonly configService;
    private readonly pluginsService;
    private readonly schedulerService;
    private readonly homebridgeIpcService;
    private readonly logger;
    private restoreDirectory;
    constructor(configService: ConfigService, pluginsService: PluginsService, schedulerService: SchedulerService, homebridgeIpcService: HomebridgeIpcService, logger: Logger);
    scheduleInstanceBackups(): void;
    private createBackup;
    ensureScheduledBackupPath(): Promise<void>;
    runScheduledBackupJob(): Promise<void>;
    getNextBackupTime(): Promise<{
        next: boolean | Date;
    }>;
    listScheduledBackups(): Promise<{
        id: string;
        instanceId: string;
        timestamp: Date;
        fileName: string;
    }[]>;
    getScheduledBackup(backupId: string): Promise<StreamableFile>;
    downloadBackup(reply: FastifyReply): Promise<StreamableFile>;
    uploadBackupRestore(data: MultipartFile): Promise<void>;
    removeRestoreDirectory(): Promise<void>;
    triggerHeadlessRestore(): Promise<{
        status: number;
    }>;
    restoreFromBackup(client: EventEmitter, autoRestart?: boolean): Promise<{
        status: number;
    }>;
    uploadHbfxRestore(data: MultipartFile): Promise<void>;
    restoreHbfxBackup(client: EventEmitter): Promise<{
        status: number;
    }>;
    postBackupRestoreRestart(): {
        status: number;
    };
    private checkBridgeBindConfig;
}
