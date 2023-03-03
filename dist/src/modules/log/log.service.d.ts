/// <reference types="node" />
import { EventEmitter } from 'events';
import { ConfigService } from '../../core/config/config.service';
import { NodePtyService } from '../../core/node-pty/node-pty.service';
export declare type LogTermSize = {
    cols: number;
    rows: number;
};
export declare class LogService {
    private configService;
    private nodePtyService;
    private command;
    private useNative;
    private ending;
    private nativeTail;
    constructor(configService: ConfigService, nodePtyService: NodePtyService);
    setLogMethod(): void;
    connect(client: EventEmitter, size: LogTermSize): void;
    private tailLog;
    private logFromFile;
    private logFromSystemd;
    private tailLogFromFileNative;
    private logFromCommand;
    private logNotConfigured;
}
