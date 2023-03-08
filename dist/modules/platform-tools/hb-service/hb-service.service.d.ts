/// <reference types="node" />
/// <reference types="node" />
import * as fs from 'fs-extra';
import * as stream from 'stream';
import { ConfigService } from '../../../core/config/config.service';
import { Logger } from '../../../core/logger/logger.service';
export declare class HbServiceService {
    private readonly configService;
    private readonly logger;
    private hbServiceSettingsPath;
    constructor(configService: ConfigService, logger: Logger);
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
    setHomebridgeStartupSettings(data: any): Promise<void>;
    setFullServiceRestartFlag(): Promise<{
        status: number;
    }>;
    downloadLogFile(shouldRemoveColour: boolean): Promise<stream.Transform | fs.ReadStream>;
    truncateLogFile(username?: string): Promise<{
        status: number;
    }>;
}
