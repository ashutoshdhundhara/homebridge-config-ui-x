import { ConsoleLogger } from '@nestjs/common';
export declare class Logger extends ConsoleLogger {
    private pluginName;
    private useTimestamps;
    private get prefix();
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    debug(...args: any[]): void;
    verbose(...args: any[]): void;
}
