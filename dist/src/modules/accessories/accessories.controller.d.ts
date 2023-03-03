import { AccessoriesService } from './accessories.service';
import { AccessorySetCharacteristicDto } from './accessories.dto';
export declare class AccessoriesController {
    private readonly accessoriesService;
    constructor(accessoriesService: AccessoriesService);
    getAccessories(): Promise<import("@oznu/hap-client").ServiceType[]>;
    getAccessoryLayout(req: any): Promise<any>;
    getAccessory(uniqueId: string): Promise<import("@oznu/hap-client").ServiceType>;
    setAccessoryCharacteristic(uniqueId: any, body: AccessorySetCharacteristicDto): Promise<import("@oznu/hap-client").ServiceType>;
}
