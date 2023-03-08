/// <reference types="node" />
import { EventEmitter } from 'events';
import { WsException } from '@nestjs/websockets';
import { Logger } from '../../core/logger/logger.service';
import { BackupService } from './backup.service';
export declare class BackupGateway {
    private backupService;
    private logger;
    constructor(backupService: BackupService, logger: Logger);
    doRestore(client: EventEmitter): Promise<WsException | {
        status: number;
    }>;
    doRestoreHbfx(client: EventEmitter): Promise<WsException | {
        status: number;
    }>;
}
