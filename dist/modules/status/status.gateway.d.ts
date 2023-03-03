import { WsException } from '@nestjs/websockets';
import { PluginsService } from '../plugins/plugins.service';
import { StatusService } from './status.service';
import { ChildBridgesService } from '../child-bridges/child-bridges.service';
export declare class StatusGateway {
    private statusService;
    private pluginsService;
    private childBridgesService;
    constructor(statusService: StatusService, pluginsService: PluginsService, childBridgesService: ChildBridgesService);
    getDashboardLayout(client: any, payload: any): Promise<any>;
    setDashboardLayout(client: any, payload: any): Promise<WsException | {
        status: string;
    }>;
    homebridgeVersionCheck(client: any, payload: any): Promise<WsException | import("../plugins/types").HomebridgePlugin>;
    npmVersionCheck(client: any, payload: any): Promise<WsException | import("../plugins/types").HomebridgePlugin>;
    nodeJsVersionCheck(client: any, payload: any): Promise<unknown>;
    getOutOfDatePlugins(client: any, payload: any): Promise<WsException | import("../plugins/types").HomebridgePlugin[]>;
    getHomebridgeServerInfo(client: any, payload: any): Promise<WsException | {
        serviceUser: string;
        homebridgeConfigJsonPath: string;
        homebridgeStoragePath: string;
        homebridgeInsecureMode: boolean;
        homebridgeCustomPluginPath: string;
        homebridgeRunningInDocker: boolean;
        homebridgeRunningInSynologyPackage: boolean;
        homebridgeRunningInPackageMode: boolean;
        homebridgeServiceMode: boolean;
        nodeVersion: string;
        os: import("systeminformation").Systeminformation.OsData;
        time: import("systeminformation").Systeminformation.TimeData;
        network: {};
    }>;
    getServerCpuInfo(client: any, payload: any): Promise<WsException | {
        cpuTemperature: {
            main: number;
            cores: any[];
            max: number;
        };
        currentLoad: number;
        cpuLoadHistory: number[];
    }>;
    getServerMemoryInfo(client: any, payload: any): Promise<WsException | {
        mem: import("systeminformation").Systeminformation.MemData;
        memoryUsageHistory: number[];
    }>;
    getServerNetworkInfo(client: any, payload: any): Promise<WsException | {
        net: import("systeminformation").Systeminformation.NetworkStatsData;
        point: number;
    }>;
    getServerUptimeInfo(client: any, payload: any): Promise<WsException | {
        time: import("systeminformation").Systeminformation.TimeData;
        processUptime: number;
    }>;
    getHomebridgePairingPin(client: any, payload: any): Promise<WsException | {
        pin: string;
        setupUri: string;
    }>;
    getHomebridgeStatus(client: any, payload: any): Promise<WsException | {
        status: import("./status.service").HomebridgeStatus;
        consolePort: number;
        port: number;
        pin: string;
        setupUri: string;
        packageVersion: any;
    }>;
    serverStatus(client: any, payload: any): Promise<void>;
    getChildBridges(client: any, payload: any): Promise<unknown>;
    watchChildBridgeStatus(client: any, payload: any): Promise<void>;
    getRaspberryPiThrottledStatus(client: any, payload: any): Promise<{}>;
}
