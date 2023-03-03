import { HomebridgeServiceHelper } from '../hb-service';
import { BasePlatform } from '../base-platform';
export declare class Win32Installer extends BasePlatform {
    constructor(hbService: HomebridgeServiceHelper);
    install(): Promise<void>;
    uninstall(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    rebuild(all?: boolean): Promise<void>;
    updateNodejs(job: {
        target: string;
        rebuild: boolean;
    }): Promise<void>;
    private checkIsAdmin;
    private downloadNssm;
    private configureFirewall;
}
