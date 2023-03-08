/// <reference types="node" />
/// <reference types="node" />
import * as fs from 'fs-extra';
export interface HomebridgeConfig {
    bridge: {
        username: string;
        pin: string;
        name: string;
        port: number;
        advertiser?: 'avahi' | 'resolved' | 'ciao' | 'bonjour-hap';
        bind?: string | string[];
    };
    mdns?: {
        interface?: string | string[];
    };
    platforms: Record<string, any>[];
    accessories: Record<string, any>[];
    plugins?: string[];
    disabledPlugins?: string[];
}
export declare class ConfigService {
    name: string;
    configPath: string;
    storagePath: string;
    customPluginPath: string;
    strictPluginResolution: boolean;
    secretPath: string;
    authPath: string;
    accessoryLayoutPath: string;
    configBackupPath: string;
    instanceBackupPath: string;
    homebridgeInsecureMode: boolean;
    homebridgeNoTimestamps: boolean;
    homebridgeVersion: string;
    minimumNodeVersion: string;
    serviceMode: boolean;
    runningInDocker: boolean;
    runningInSynologyPackage: boolean;
    runningInPackageMode: boolean;
    runningInLinux: boolean;
    runningInFreeBSD: boolean;
    canShutdownRestartHost: boolean;
    enableTerminalAccess: boolean;
    usePnpm: boolean;
    usePluginBundles: boolean;
    recommendChildBridges: boolean;
    runningOnRaspberryPi: boolean;
    startupScript: string;
    dockerOfflineUpdate: boolean;
    package: any;
    setupWizardComplete: boolean;
    customWallpaperPath: string;
    customWallpaperHash: string;
    hbServiceUiRestartRequired: boolean;
    homebridgeConfig: HomebridgeConfig;
    ui: {
        name: string;
        port: number;
        host?: '::' | '0.0.0.0' | string;
        auth: 'form' | 'none';
        theme: string;
        sudo?: boolean;
        restart?: string;
        lang?: string;
        log?: {
            method: 'file' | 'custom' | 'systemd' | 'native';
            command?: string;
            path?: string;
            service?: string;
        };
        ssl?: {
            key?: string;
            cert?: string;
            pfx?: string;
            passphrase?: string;
        };
        accessoryControl?: {
            debug?: boolean;
            instanceBlacklist?: string[];
        };
        temp?: string;
        tempUnits?: string;
        loginWallpaper?: string;
        noFork?: boolean;
        linux?: {
            shutdown?: string;
            restart?: string;
        };
        standalone?: boolean;
        debug?: boolean;
        proxyHost?: string;
        sessionTimeout?: number;
        homebridgePackagePath?: string;
        scheduledBackupPath?: string;
        scheduledBackupDisable?: boolean;
        disableServerMetricsMonitoring?: boolean;
    };
    private bridgeFreeze;
    private uiFreeze;
    secrets: {
        secretKey: string;
    };
    instanceId: string;
    constructor();
    parseConfig(homebridgeConfig: any): void;
    uiSettings(): {
        env: {
            enableAccessories: boolean;
            enableTerminalAccess: boolean;
            homebridgeVersion: string;
            homebridgeInstanceName: string;
            nodeVersion: string;
            packageName: any;
            packageVersion: any;
            platform: NodeJS.Platform;
            runningInDocker: boolean;
            runningInSynologyPackage: boolean;
            runningInPackageMode: boolean;
            runningInLinux: boolean;
            runningInFreeBSD: boolean;
            runningOnRaspberryPi: boolean;
            canShutdownRestartHost: boolean;
            dockerOfflineUpdate: boolean;
            serviceMode: boolean;
            temperatureUnits: string;
            lang: string;
            instanceId: string;
            customWallpaperHash: string;
            setupWizardComplete: boolean;
            recommendChildBridges: boolean;
        };
        formAuth: boolean;
        theme: string;
        serverTimestamp: string;
    };
    uiRestartRequired(): Promise<boolean>;
    private freezeUiSettings;
    private setConfigForDocker;
    private setConfigForServiceMode;
    private getSecrets;
    private generateSecretToken;
    private getInstanceId;
    private getCustomWallpaperHash;
    private checkIfRunningOnRaspberryPi;
    streamCustomWallpaper(): fs.ReadStream;
}
