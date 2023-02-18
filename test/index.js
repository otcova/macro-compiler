import fs from "fs/promises";
import { compileMacros } from "../lib/index.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localPath = (...dir) => path.join(__dirname, ...dir);

async function testCompilation(folder, targetName) {
	try {
		let lib = await import(folder + "index.js");
		if (lib.default() != targetName) throw new Error();

		console.log(`[SUCCESS compile ${targetName}]`);
	} catch (error) {
		console.error(`[ERROR compile ${targetName}] ${error}`);
	}
}

async function testFileDelete(file, targetName) {
	const fileExists = async path => !!(await fs.stat(path).catch(e => false));

	if (await fileExists(file)) console.log(`[ERROR remove non ${targetName} files]`);
	else console.error(`[SUCCESS remove non ${targetName} files]`);
}

async function main() {
	await Promise.all([
		fs.rm(localPath("nodejs", "src"), { recursive: true, force: true }),
		fs.rm(localPath("browser", "src"), { recursive: true, force: true }),
	]);

	await compileMacros({
		baseDir: __dirname,
		srcDir: "src",
	});

	await Promise.all([
		testCompilation("./NodeJs/src/", "NodeJs"),
		testCompilation("./Browser/src/", "Browser"),
	]);

	await Promise.all([
		testFileDelete(localPath("./NodeJs/src/browser-specific.js"), "NodeJs"),
		testFileDelete(localPath("./Browser/src/nodejs-specific.js"), "Browser"),
	]);
}

main();
