import { TerminalService, WsEventEmitter, TermSize } from './terminal.service';
export declare class TerminalGateway {
    private readonly terminalService;
    constructor(terminalService: TerminalService);
    startTerminalSession(client: WsEventEmitter, payload: TermSize): Promise<void>;
}
