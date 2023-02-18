import path from "path";

export interface FileContent {
	path: string,
	body: string,
}

let error = false;
export function compilationError(file: FileContent, message: string, position: number, priority = true) {
	if (error && !priority) return;
	error = true;
	
	position = Math.min(position, file.body.length);
	let line: number | string = 1, column: number | string = 1;
	for (let i = 1; i < position; ++i) {
		if (file.body[i - 1] == "\n") {
			line += 1;
			column = 1;
		} else ++column;
	}
	const colors = {
		reset: "\x1b[0m",
		red: "\x1b[31m",
		yellow: "\x1b[33m",
		cyan: "\x1b[36m",
	};
	const filePath = colors.cyan + path.relative(process.cwd(), file.path) + colors.reset;
	line = colors.yellow + line + colors.reset;
	column = colors.yellow + column + colors.reset;
	message = colors.red + "error " + colors.reset + message;
	console.error(`${filePath}:${line}:${column} - ${message}`);
}
