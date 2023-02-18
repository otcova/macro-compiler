export declare function getFiles(dir: string, callback: (file: string) => Promise<void> | void): Promise<void>;
export declare function writeFile(filePath: string, content: string): Promise<void>;
export declare function readFile(filePath: string): Promise<string>;
