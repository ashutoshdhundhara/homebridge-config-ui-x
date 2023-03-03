import * as si from 'systeminformation';
import { ServiceUnavailableException } from '@nestjs/common';
import { Logger } from '../../core/logger/logger.service';
import { ConfigService } from '../../core/config/config.service';
import { HomebridgeIpcService } from '../../core/homebridge-ipc/homebridge-ipc.service';
import { ConfigEditorService } from '../config-editor/config-editor.service';
import { AccessoriesService } from '../accessories/accessories.service';
import { HomebridgeMdnsSettingDto } from './server.dto';
export declare class ServerService {
    private readonly configService;
    private readonly configEditorService;
    private readonly accessoriesService;
    private readonly homebridgeIpcService;
    private readonly logger;
    private serverServiceCache;
    private accessoryId;
    private accessoryInfoPath;
    setupCode: string | null;
    constructor(configService: ConfigService, configEditorService: ConfigEditorService, accessoriesService: AccessoriesService, homebridgeIpcService: HomebridgeIpcService, logger: Logger);
    restartServer(): Promise<{
        ok: boolean;
        command: string;
        restartingUI: boolean;
    }>;
    resetHomebridgeAccessory(): Promise<void>;
    getDevicePairings(): Promise<any[]>;
    getDevicePairingById(deviceId: string): Promise<any>;
    deleteDevicePairing(id: string): Promise<void>;
    getCachedAccessories(): Promise<any[]>;
    deleteCachedAccessory(uuid: string, cacheFile: string): Promise<{
        ok: boolean;
    }>;
    resetCachedAccessories(): Promise<{
        ok: boolean;
    }>;
    getSetupCode(): Promise<string | null>;
    private generateSetupCode;
    getBridgePairingInformation(): Promise<ServiceUnavailableException | {
        displayName: any;
        pincode: any;
        setupCode: string;
        isPaired: boolean;
    }>;
    getSystemNetworkInterfaces(): Promise<si.Systeminformation.NetworkInterfacesData[]>;
    getHomebridgeNetworkInterfaces(): Promise<string[]>;
    getHomebridgeMdnsSetting(): Promise<HomebridgeMdnsSettingDto>;
    setHomebridgeMdnsSetting(setting: HomebridgeMdnsSettingDto): Promise<void>;
    setHomebridgeNetworkInterfaces(adapters: string[]): Promise<void>;
    lookupUnusedPort(): Promise<{
        port: number;
    }>;
    private nodeVersionChanged;
}
