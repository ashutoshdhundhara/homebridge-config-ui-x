/// <reference types="node" />
import { EventEmitter } from 'events';
import { LogService, LogTermSize } from './log.service';
export declare class LogGateway {
    private logService;
    constructor(logService: LogService);
    connect(client: EventEmitter, payload: LogTermSize): void;
}
