import fs from "fs/promises";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localPath = (...dir) => path.join(__dirname, ...dir);

const style = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
};

async function testCompilation(folder, targetName) {
	try {
		let lib = await import(folder + "index.js");
		if (lib.default() != targetName) throw new Error();

		logSuccess(`Compile ${targetName}`);
	} catch (error) {
		const msg = `Compile ${targetName}`;
		if (error) logError(msg + " - " + String(error));
		else logError(msg);
	}
}

async function testFileDelete(file, targetName) {
	const pathExists = async path => !!(await fs.stat(path).catch(e => false));

	const msg = `Remove non ${targetName} files`;
	if (await pathExists(file)) logError(msg);
	else logSuccess(msg);
}

function logError(msg) {
	console.error(`${style.red}[ERROR]${style.reset} ${msg}`);
	process.exitCode = 1;
}

function logSuccess(msg) {
	console.error(`${style.green}[SUCCESS]${style.reset} ${msg}`);
}

await Promise.all([
	testCompilation("./NodeJs/src/", "NodeJs"),
	testCompilation("./Browser/src/", "Browser"),
	testFileDelete(localPath("./NodeJs/src/browser-specific.js"), "NodeJs"),
	testFileDelete(localPath("./Browser/src/nodejs-specific.js"), "Browser"),
]);
