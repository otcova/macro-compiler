import path from "path";
export const style = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
};
let error = false;
export function compilationError(file, message, position, priority = true) {
    if (error && !priority)
        return;
    error = true;
    position = Math.min(position, file.body.length);
    let line = 1, column = 1;
    for (let i = 1; i < position; ++i) {
        if (file.body[i - 1] == "\n") {
            line += 1;
            column = 1;
        }
        else
            ++column;
    }
    const filePath = style.cyan + path.relative(process.cwd(), file.path) + style.reset;
    line = style.yellow + line + style.reset;
    column = style.yellow + column + style.reset;
    message = style.red + "error " + style.reset + message;
    console.error(`${filePath}:${line}:${column} - ${message}`);
}
export function logError(message) {
    console.error(`${style.red}[ERROR]${style.reset} ${message}`);
}
