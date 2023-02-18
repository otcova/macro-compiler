export interface Options {
    rootDir?: string;
    srcDir: string;
    clean: boolean;
    targets?: {
        name: string;
        dstDirectory?: string;
    }[];
}
export declare function compileMacros(opts: Options): Promise<void>;
