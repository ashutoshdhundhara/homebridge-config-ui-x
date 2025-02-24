/// <reference types="node" />
/// <reference types="node" />
import { HbServiceService } from './hb-service.service';
import { HbServiceStartupSettings } from './hb-service.dto';
export declare class HbServiceController {
    private readonly hbServiceService;
    constructor(hbServiceService: HbServiceService);
    getHomebridgeStartupSettings(): Promise<{
        HOMEBRIDGE_DEBUG: any;
        HOMEBRIDGE_KEEP_ORPHANS: any;
        HOMEBRIDGE_INSECURE: any;
        ENV_DEBUG: any;
        ENV_NODE_OPTIONS: any;
    } | {
        HOMEBRIDGE_INSECURE: boolean;
        HOMEBRIDGE_DEBUG?: undefined;
        HOMEBRIDGE_KEEP_ORPHANS?: undefined;
        ENV_DEBUG?: undefined;
        ENV_NODE_OPTIONS?: undefined;
    } | {
        HOMEBRIDGE_DEBUG?: undefined;
        HOMEBRIDGE_KEEP_ORPHANS?: undefined;
        HOMEBRIDGE_INSECURE?: undefined;
        ENV_DEBUG?: undefined;
        ENV_NODE_OPTIONS?: undefined;
    }>;
    setHomebridgeStartupSettings(body: HbServiceStartupSettings): Promise<void>;
    setFullServiceRestartFlag(): Promise<{
        status: number;
    }>;
    downloadLogFile(colour?: string): Promise<import("stream").Transform | import("fs").ReadStream>;
    truncateLogFile(req: any): Promise<{
        status: number;
    }>;
}
