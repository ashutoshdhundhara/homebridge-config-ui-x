import { Logger } from '../../core/logger/logger.service';
import { ConfigService } from '../../core/config/config.service';
import { HomebridgeIpcService } from '../../core/homebridge-ipc/homebridge-ipc.service';
import { AccessoriesService } from '../accessories/accessories.service';
export declare class ChildBridgesService {
    private readonly logger;
    private readonly configService;
    private readonly homebridgeIpcService;
    private readonly accessoriesService;
    constructor(logger: Logger, configService: ConfigService, homebridgeIpcService: HomebridgeIpcService, accessoriesService: AccessoriesService);
    getChildBridges(): Promise<unknown>;
    watchChildBridgeStatus(client: any): Promise<void>;
    stopStartRestartChildBridge(event: 'startChildBridge' | 'stopChildBridge' | 'restartChildBridge', deviceId: string): {
        ok: boolean;
    };
    restartChildBridge(deviceId: string): {
        ok: boolean;
    };
    stopChildBridge(deviceId: string): {
        ok: boolean;
    };
    startChildBridge(deviceId: string): {
        ok: boolean;
    };
}
