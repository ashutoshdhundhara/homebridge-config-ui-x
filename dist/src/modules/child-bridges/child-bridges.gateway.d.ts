import { WsException } from '@nestjs/websockets';
import { ChildBridgesService } from './child-bridges.service';
export declare class ChildBridgesGateway {
    private childBridgesService;
    constructor(childBridgesService: ChildBridgesService);
    getChildBridges(client: any, payload: any): Promise<unknown>;
    watchChildBridgeStatus(client: any, payload: any): Promise<void>;
    restartChildBridge(client: any, payload: any): Promise<WsException | {
        ok: boolean;
    }>;
    stopChildBridge(client: any, payload: any): Promise<WsException | {
        ok: boolean;
    }>;
    startChildBridge(client: any, payload: any): Promise<WsException | {
        ok: boolean;
    }>;
}
