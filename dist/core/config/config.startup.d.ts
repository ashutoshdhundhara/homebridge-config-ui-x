/// <reference types="node" />
export declare function getStartupConfig(): Promise<{
    host?: '::' | '0.0.0.0' | string;
    httpsOptions?: {
        key?: Buffer;
        cert?: Buffer;
        pfx?: Buffer;
        passphrase?: string;
    };
    cspWsOveride?: string;
    debug?: boolean;
}>;
