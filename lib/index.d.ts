export interface Options {
    baseDir?: string;
    srcDir: string;
    targets?: {
        name: string;
        dstDir?: string;
    }[];
}
export declare function compileMacros(opts: Options): Promise<void>;
