import { HomebridgeServiceHelper } from '../hb-service';
import { BasePlatform } from '../base-platform';
export declare class DarwinInstaller extends BasePlatform {
    private user;
    constructor(hbService: HomebridgeServiceHelper);
    private get plistName();
    private get plistPath();
    install(): Promise<void>;
    uninstall(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    rebuild(all?: boolean): Promise<void>;
    getId(): Promise<{
        uid: number;
        gid: number;
    }>;
    getPidOfPort(port: number): string;
    private checkForRoot;
    private fixStoragePath;
    private getUserHomeDir;
    updateNodejs(job: {
        target: string;
        rebuild: boolean;
    }): Promise<void>;
    private checkGlobalNpmAccess;
    private setNpmPermissions;
    private isPackage;
    private createLaunchAgent;
}
