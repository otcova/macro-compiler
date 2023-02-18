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

		console.log(`${style.green}[SUCCESS]${style.reset} Compile ${targetName}`);
	} catch (error) {
		const msg = `${style.red}[ERROR]${style.reset} Compile ${targetName}]`;
		if (error) console.error(msg, "-", error);
		else console.log(msg);
	}
}

async function testFileDelete(file, targetName) {
	const pathExists = async path => !!(await fs.stat(path).catch(e => false));

	const msg = `${style.reset} Remove non ${targetName} files`;
	if (await pathExists(file)) console.log(style.red + "[ERROR]" + msg);
	else console.error(style.green + "[SUCCESS]" + msg);
}

Promise.all([
	testCompilation("./NodeJs/src/", "NodeJs"),
	testCompilation("./Browser/src/", "Browser"),
	testFileDelete(localPath("./NodeJs/src/browser-specific.js"), "NodeJs"),
	testFileDelete(localPath("./Browser/src/nodejs-specific.js"), "Browser"),
]);