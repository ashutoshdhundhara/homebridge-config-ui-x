/// <reference types="node" />
/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { ConfigService } from '../config/config.service';
import { Logger } from '../logger/logger.service';
export declare class HomebridgeIpcService extends EventEmitter {
    private logger;
    private configService;
    private homebridge;
    private permittedEvents;
    constructor(logger: Logger, configService: ConfigService);
    setHomebridgeProcess(process: ChildProcess): void;
    setHomebridgeVersion(version: string): void;
    requestResponse(requestEvent: string, responseEvent: string): Promise<unknown>;
    sendMessage(type: string, data?: unknown): void;
    restartHomebridge(): void;
    restartAndWaitForClose(): Promise<boolean>;
    killHomebridge(): Promise<void>;
}
