import * as si from 'systeminformation';
import { HttpService } from '@nestjs/axios';
import { Logger } from '../../core/logger/logger.service';
import { ConfigService } from '../../core/config/config.service';
import { HomebridgeIpcService } from '../../core/homebridge-ipc/homebridge-ipc.service';
import { PluginsService } from '../plugins/plugins.service';
import { ServerService } from '../server/server.service';
export declare const enum HomebridgeStatus {
    PENDING = "pending",
    OK = "ok",
    UP = "up",
    DOWN = "down"
}
export interface HomebridgeStatusUpdate {
    status: HomebridgeStatus;
    paired?: null | boolean;
    setupUri?: null | string;
    name?: string;
    username?: string;
    pin?: string;
}
export declare class StatusService {
    private httpService;
    private logger;
    private configService;
    private pluginsService;
    private serverService;
    private homebridgeIpcService;
    private statusCache;
    private dashboardLayout;
    private homebridgeStatus;
    private homebridgeStatusChange;
    private cpuLoadHistory;
    private memoryUsageHistory;
    private memoryInfo;
    private rpiGetThrottledMapping;
    constructor(httpService: HttpService, logger: Logger, configService: ConfigService, pluginsService: PluginsService, serverService: ServerService, homebridgeIpcService: HomebridgeIpcService);
    private getCpuLoadPoint;
    private getMemoryUsagePoint;
    private getCpuLoadPointAlt;
    private getCpuTemp;
    private getCpuTempLegacy;
    private getCpuTempAlt;
    getCurrentNetworkUsage(): Promise<{
        net: si.Systeminformation.NetworkStatsData;
        point: number;
    }>;
    getDashboardLayout(): Promise<any>;
    setDashboardLayout(layout: any): Promise<{
        status: string;
    }>;
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
        mem: si.Systeminformation.MemData;
        memoryUsageHistory: number[];
    }>;
    getServerUptimeInfo(): Promise<{
        time: si.Systeminformation.TimeData;
        processUptime: number;
    }>;
    getHomebridgePairingPin(): Promise<{
        pin: string;
        setupUri: string;
    }>;
    getHomebridgeStatus(): Promise<{
        status: HomebridgeStatus;
        consolePort: number;
        port: number;
        pin: string;
        setupUri: string;
        packageVersion: any;
    }>;
    watchStats(client: any): Promise<void>;
    private getHomebridgeStats;
    checkHomebridgeStatus(): Promise<HomebridgeStatus>;
    private getDefaultInterface;
    private getOsInfo;
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
        os: si.Systeminformation.OsData;
        time: si.Systeminformation.TimeData;
        network: {};
    }>;
    getHomebridgeVersion(): Promise<import("../plugins/types").HomebridgePlugin>;
    getNodeJsVersionInfo(): Promise<unknown>;
    getRaspberryPiThrottledStatus(): Promise<{}>;
}
