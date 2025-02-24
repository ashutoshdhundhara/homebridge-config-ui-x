import { HomebridgeServiceHelper } from './hb-service';
export declare class BasePlatform {
    hbService: HomebridgeServiceHelper;
    constructor(hbService: HomebridgeServiceHelper);
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
    getPidOfPort(port: number): string | null;
    updateNodejs(job: {
        target: string;
        rebuild: boolean;
    }): Promise<void>;
}
