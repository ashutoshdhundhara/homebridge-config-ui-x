import { HomebridgeServiceHelper } from '../hb-service';
import { BasePlatform } from '../base-platform';
export declare class LinuxInstaller extends BasePlatform {
    constructor(hbService: HomebridgeServiceHelper);
    private get systemdServiceName();
    private get systemdServicePath();
    private get systemdEnvPath();
    private get runPartsPath();
    install(): Promise<void>;
    uninstall(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    beforeStart(): Promise<void>;
    rebuild(all?: boolean): Promise<void>;
    getId(): Promise<{
        uid: number;
        gid: number;
    }>;
    getPidOfPort(port: number): string;
    updateNodejs(job: {
        target: string;
        rebuild: boolean;
    }): Promise<void>;
    private updateNodeFromTarball;
    private updateNodeFromNodesource;
    private reloadSystemd;
    private enableService;
    private disableService;
    private checkForRoot;
    private checkIsNotRoot;
    private checkUser;
    private setupSudo;
    private isPackage;
    private fixPermissions;
    private createFirewallRules;
    private createUfwRules;
    private createFirewallCmdRules;
    private createRunPartsPath;
    private createSystemdEnvFile;
    private createSystemdService;
}
