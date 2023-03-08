import { ChildBridgesService } from '../child-bridges/child-bridges.service';
import { ServerService } from './server.service';
import { HomebridgeMdnsSettingDto, HomebridgeNetworkInterfacesDto } from './server.dto';
export declare class ServerController {
    private serverService;
    private childBridgesService;
    constructor(serverService: ServerService, childBridgesService: ChildBridgesService);
    restartServer(): Promise<{
        ok: boolean;
        command: string;
        restartingUI: boolean;
    }>;
    restartChildBridge(deviceId: string): {
        ok: boolean;
    };
    stopChildBridge(deviceId: string): {
        ok: boolean;
    };
    startChildBridge(deviceId: string): {
        ok: boolean;
    };
    getBridgePairingInformation(): Promise<import("@nestjs/common").ServiceUnavailableException | {
        displayName: any;
        pincode: any;
        setupCode: string;
        isPaired: boolean;
    }>;
    resetHomebridgeAccessory(): Promise<void>;
    resetCachedAccessories(): Promise<{
        ok: boolean;
    }>;
    getCachedAccessories(): Promise<any[]>;
    deleteCachedAccessory(uuid: string, cacheFile?: string): Promise<{
        ok: boolean;
    }>;
    getDevicePairings(): Promise<any[]>;
    getDevicePairingById(deviceId: string): Promise<any>;
    deleteDevicePairing(deviceId: string): Promise<void>;
    lookupUnusedPort(): Promise<{
        port: number;
    }>;
    getSystemNetworkInterfaces(): Promise<import("systeminformation").Systeminformation.NetworkInterfacesData[]>;
    getHomebridgeNetworkInterfaces(): Promise<string[]>;
    setHomebridgeNetworkInterfaces(body: HomebridgeNetworkInterfacesDto): Promise<void>;
    getHomebridgeMdnsSetting(): Promise<HomebridgeMdnsSettingDto>;
    setHomebridgeMdnsSetting(body: HomebridgeMdnsSettingDto): Promise<void>;
}
