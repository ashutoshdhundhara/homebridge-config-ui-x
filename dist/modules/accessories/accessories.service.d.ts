import * as NodeCache from 'node-cache';
import { HapClient, ServiceType } from '@ashutoshdhundhara/hap-client';
import { ConfigService } from '../../core/config/config.service';
import { Logger } from '../../core/logger/logger.service';
export declare class AccessoriesService {
    private readonly configService;
    private readonly logger;
    hapClient: HapClient;
    accessoriesCache: NodeCache;
    constructor(configService: ConfigService, logger: Logger);
    connect(client: any): Promise<void>;
    private refreshCharacteristics;
    loadAccessories(): Promise<ServiceType[]>;
    getAccessory(uniqueId: string): Promise<ServiceType>;
    setAccessoryCharacteristic(uniqueId: string, characteristicType: string, value: number | boolean | string): Promise<ServiceType>;
    getAccessoryLayout(username: string): Promise<any>;
    saveAccessoryLayout(user: string, layout: Record<string, unknown>): Promise<Record<string, unknown>>;
    resetInstancePool(): void;
}
