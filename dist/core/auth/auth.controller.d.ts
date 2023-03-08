/// <reference types="node" />
/// <reference types="node" />
import { AuthService } from './auth.service';
import { AuthDto } from './auth.dto';
import { ConfigService } from '../config/config.service';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    constructor(authService: AuthService, configService: ConfigService);
    signIn(body: AuthDto): Promise<any>;
    getSettings(): {
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
    getCustomWallpaper(): import("fs").ReadStream;
    getToken(): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }>;
    checkAuth(): {
        status: string;
    };
}
