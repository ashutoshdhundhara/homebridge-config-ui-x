import { StreamableFile } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { BackupService } from './backup.service';
import { Logger } from '../../core/logger/logger.service';
export declare class BackupController {
    private backupService;
    private logger;
    constructor(backupService: BackupService, logger: Logger);
    downloadBackup(res: any): Promise<StreamableFile>;
    getNextBackupTime(): Promise<{
        next: boolean | Date;
    }>;
    listScheduledBackups(): Promise<{
        id: string;
        instanceId: string;
        timestamp: Date;
        fileName: string;
    }[]>;
    getScheduledBackup(backupId: any): Promise<StreamableFile>;
    restoreBackup(req: FastifyRequest): Promise<void>;
    restoreBackupTrigger(): Promise<{
        status: number;
    }>;
    restoreHbfx(req: FastifyRequest): Promise<void>;
    postBackupRestoreRestart(): {
        status: number;
    };
}
