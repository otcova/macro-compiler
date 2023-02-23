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
export interface ParsedFile {
    path: string;
    body: string;
    macros: FoundMacro[];
}
/**
 * Represents the [start, end] of a string slice
 * @example const slice = myString.slice(...sliceIndex)
 */
type SliceIndex = [number, number];
interface ReplaceSlice {
    slice: SliceIndex;
    value: string;
}
interface FoundMacro {
    replace: ReplaceSlice[];
    header: SliceIndex;
    body: SliceIndex;
}
export {};
