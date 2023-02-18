/** dir: path of a file or a directory */
export declare function getFiles(dir: string, callback: (file: string) => Promise<void> | void): Promise<void>;
export declare function writeFile(filePath: string, content: string): Promise<void>;
export declare function readFile(filePath: string): Promise<string>;
export declare function deleteAll(path: string): Promise<void>;
export declare function isFile(path: string): Promise<boolean>;
export declare function isDirectory(path: string): Promise<boolean>;
