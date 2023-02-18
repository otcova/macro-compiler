export declare const style: {
    reset: string;
    bold: string;
    red: string;
    yellow: string;
    blue: string;
    cyan: string;
};
export interface FileContent {
    path: string;
    body: string;
}
export declare function compilationError(file: FileContent, message: string, position: number, priority?: boolean): void;
export declare function logError(message: string): void;
