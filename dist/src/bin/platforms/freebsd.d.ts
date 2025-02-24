import { HomebridgeServiceHelper } from '../hb-service';
import { BasePlatform } from '../base-platform';
export declare class FreeBSDInstaller extends BasePlatform {
    constructor(hbService: HomebridgeServiceHelper);
    private get rcServiceName();
    private get rcServicePath();
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
    private enableService;
    private disableService;
    private checkForRoot;
    private checkUser;
    private setupSudo;
    updateNodejs(job: {
        target: string;
        rebuild: boolean;
    }): Promise<void>;
    private createRCService;
}
