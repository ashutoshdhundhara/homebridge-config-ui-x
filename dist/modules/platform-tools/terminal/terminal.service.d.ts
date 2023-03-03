/// <reference types="node" />
import { EventEmitter } from 'events';
import { ConfigService } from '../../../core/config/config.service';
import { Logger } from '../../../core/logger/logger.service';
import { NodePtyService } from '../../../core/node-pty/node-pty.service';
export declare type TermSize = {
    cols: number;
    rows: number;
};
export interface WsEventEmitter extends EventEmitter {
    disconnect: () => void;
}
export declare class TerminalService {
    private configService;
    private logger;
    private nodePtyService;
    private ending;
    constructor(configService: ConfigService, logger: Logger, nodePtyService: NodePtyService);
    startSession(client: WsEventEmitter, size: TermSize): Promise<void>;
}
