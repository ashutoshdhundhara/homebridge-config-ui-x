import { StreamableFile } from '@nestjs/common';
import { HomebridgeHueService } from './homebridge-hue.service';
export declare class HomebridgeHueController {
    private homebridgeHueService;
    constructor(homebridgeHueService: HomebridgeHueService);
    exchangeCredentials(): Promise<StreamableFile>;
}
