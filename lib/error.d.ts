export interface FileContent {
    path: string;
    body: string;
}
export declare function compilationError(file: FileContent, message: string, position: number, priority?: boolean): void;
