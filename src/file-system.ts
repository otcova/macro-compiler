import fs from "fs/promises";
import path from "path";

export async function getFiles(dir: string, callback: (file: string) => Promise<void> | void) {
	const dirEntries = await fs.readdir(dir, { withFileTypes: true });
	await Promise.all(dirEntries.map(async entry => {
		if (entry.isDirectory()) {
			getFiles(path.join(dir, entry.name), async fileName =>
				await callback(path.join(entry.name, fileName))
			);
		} else await callback(entry.name);
	}));
}

export async function writeFile(filePath: string, content: string) {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, content);
}

export async function readFile(filePath: string) {
	return (await fs.readFile(filePath)).toString();
}