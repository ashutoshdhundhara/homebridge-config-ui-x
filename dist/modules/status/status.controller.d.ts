import { StatusService } from './status.service';
import { ChildBridgesService } from '../child-bridges/child-bridges.service';
export declare class StatusController {
    private readonly statusService;
    private readonly childBridgesService;
    constructor(statusService: StatusService, childBridgesService: ChildBridgesService);
    getServerCpuInfo(): Promise<{
        cpuTemperature: {
            main: number;
            cores: any[];
            max: number;
        };
        currentLoad: number;
        cpuLoadHistory: number[];
    }>;
    getServerMemoryInfo(): Promise<{
        mem: import("systeminformation").Systeminformation.MemData;
        memoryUsageHistory: number[];
    }>;
    getServerNetworkInfo(): Promise<{
        net: import("systeminformation").Systeminformation.NetworkStatsData;
        point: number;
    }>;
    getServerUptimeInfo(): Promise<{
        time: import("systeminformation").Systeminformation.TimeData;
        processUptime: number;
    }>;
    checkHomebridgeStatus(): Promise<{
        status: import("./status.service").HomebridgeStatus;
    }>;
    getChildBridges(): Promise<unknown>;
    getHomebridgeVersion(): Promise<import("../plugins/types").HomebridgePlugin>;
    getHomebridgeServerInfo(): Promise<{
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
    getNodeJsVersionInfo(): Promise<unknown>;
    getRaspberryPiThrottledStatus(): Promise<{}>;
}
