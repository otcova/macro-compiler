import path from "path";
import { compilationError, FileContent, logError } from "./error.js";
import { getFiles, writeFile, readFile, isDirectory, isFile, deleteAll } from "./file-system.js";

interface Target {
	name: string,
	dstDirectory: string,
	macroHeader: string,
}

export interface Options {
	rootDir?: string,
	srcDir: string,
	clean: boolean,
	targets?: { name: string, dstDirectory?: string }[],
};

export async function compileMacros(opts: Options) {
	const rootDir = opts.rootDir ?? ".";
	
	if (!await isDirectory(rootDir)) {
		logError(`Invalid root directory '${rootDir}'`);
		return;
	}
	
	const srcDir = path.join(rootDir, opts.srcDir);

	if (await isDirectory(srcDir)) {
		opts.targets ??= [
			{ name: "NodeJs" },
			{ name: "Browser" },
		]
	} else if (await isFile(srcDir)) {
		const fileName = path.basename(srcDir);
		opts.targets ??= [
			{ name: "NodeJs", dstDirectory: "nodejs-" + fileName },
			{ name: "Browser", dstDirectory: "browser-" + fileName },
		]
	} else {
		logError(`Invalid source path '${srcDir}'`);
		return;
	}

	const targets: Target[] = opts.targets.map(target => ({
		dstDirectory: path.join(rootDir, target.name, "src"),
		...target,
		macroHeader: "if target == " + target.name,
	}));
	
	if (opts.clean) {
		for (const target of targets) {
			deleteAll(target.dstDirectory);
		}
	}

	const macroHeaders = targets.map(target => target.macroHeader);

	await getFiles(srcDir, async (relativeSrcPath) => {
		const srcPath = path.join(srcDir, relativeSrcPath);
		const body = await readFile(srcPath);

		await Promise.all(targets.map(async target => {
			const compiledSrc = compileFile({ path: srcPath, body }, target, macroHeaders);
			if (compiledSrc) {
				let dstPath = path.join(target.dstDirectory, relativeSrcPath);
				await writeFile(dstPath, compiledSrc);
			}
		}));
	});
}

function compileFile(file: FileContent, target: Target, macrosHeader: string[]) {
	let cursor = 0;
	let compiledSrc = "";
	const copy = (until: number) => {
		compiledSrc += file.body.slice(cursor, until);
		cursor = until;
	};

	for (const macro of findMacros(file)) {
		const header = file.body.slice(...macro.header).trim().replace(/\s+/g, " ");

		if (header == target.macroHeader) {
			for (const replace of macro.replace) {
				copy(replace.slice[0]);
				compiledSrc += replace.value;
				cursor = replace.slice[1];
			}
		} else if (macrosHeader.includes(header)) {
			copy(macro.body[0]);
			cursor = macro.body[1];
		} else {
			compilationError(file, `Invalid macro`, cursor, false);
		}
	}

	copy(file.body.length);
	return compiledSrc;
}

/** 
 * Represents the [start, end] of a string slice
 * @example const slice = myString.slice(...sliceIndex)
 */
type SliceIndex = [number, number];

interface FoundMacro {
	replace: {
		slice: SliceIndex,
		value: string,
	}[],
	header: SliceIndex,
	body: SliceIndex,
}

function findMacros(file: FileContent) {
	let src = file.body;
	const macros: FoundMacro[] = [];

	if (!src.endsWith("\n")) {
		if (src.includes("\r")) src += "\r\n";
		else src += "\n";
	}

	let insideBlock: string | null = null;
	let insideMacro = null;

	let lineStart = 0;
	let i = 0;

	/** Returns the index of the end of the line (excluding \r\n)*/
	const skipLine = () => {
		if (insideBlock == '"' || insideBlock == "'") insideBlock = null;
		while (src[i++] != "\n");
		lineStart = i;
		if (src[i - 1] == "\r") return i - 2;
		return i - 1;
	}

	while (i < src.length) {
		if (src[i] == "\n") {
			skipLine();
			continue;
		}

		const macro = macros[macros.length - 1];

		switch (insideBlock) {
			case '"':
			case "'":
			case "`":
				if (insideBlock == src[i]) insideBlock = null;
				++i;
				break;
			case "/*":
				if (src.slice(i, i + 2) == "*/") insideBlock = null;
				++i;
				break;
			case "/*!":
				if (src.slice(i, i + 2) == "*/") {
					const start = i;
					skipLine();

					if (src.slice(start + 2, i).trim()) {
						compilationError(file, "Invalid multiline macro termination", start + 2);
					}

					macro.replace.push({ slice: [start, start + 2], value: "//!end" });
					macro.body[1] = i;
					insideMacro = null;
					insideBlock = null;
				} else ++i;
				break;

			default:
				if ("\"'`".includes(src[i])) {
					insideBlock = src[i]
					++i;
				} else if (src.slice(i, i + 2) == "/*" && (src[i + 2] != "!" || insideMacro == "//!start")) {
					i += 2;
					insideBlock = "/*";
				} else if (src.slice(i, i + 2) == "//" && src[i + 2] != "!") {
					skipLine();
				} else if (insideMacro == "//!start") {
					if (src.slice(i, i + 6) == "//!end") {
						const start = i;
						skipLine();

						if (src.slice(start + 6, i).trim()) {
							compilationError(file, "Invalid multiline macro termination", start + 6);
						}
						macro.body[1] = i;
						insideMacro = null;
					} else ++i;
				} else if (src.slice(i, i + 9) == "//!start ") {
					const start = src.slice(lineStart, i).trim() ? i : lineStart;
					const header: SliceIndex = [i + 9, skipLine()];
					insideMacro = "//!start";
					macros.push({
						replace: [],
						header,
						body: [start, src.length],
					});
				} else if (src.slice(i, i + 3) == "//!") {
					const start = i;
					const headerEnd = skipLine();
					skipLine();

					const header: SliceIndex = [start + 3, headerEnd];

					if (start == 0 && !src.slice(headerEnd, i).trim()) {
						return [{
							replace: [],
							header,
							body: [start, src.length],
						}];
					}

					macros.push({
						replace: [],
						header,
						body: [start, i],
					});
				} else if (src.slice(i, i + 3) == "/*!") {
					const start = src.slice(lineStart, i).trim() ? i : lineStart;
					const header: SliceIndex = [i + 3, skipLine()];

					if (src.slice(...header).includes("*/")) {
						compilationError(file, "Invalid multiline macro", start);
					} else {
						insideMacro = "/*!";
						insideBlock = "/*!";
						macros.push({
							replace: [{
								slice: [start, start + 3],
								value: "//!start",
							}],
							header,
							body: [start, src.length],
						});
					}
				} else {
					++i;
				}
		}
	}

	return macros;
}

