import fs from "fs/promises";
import path from "path";
/** dir: path of a file or a directory */
export async function getFiles(dir, callback) {
    if (await isFile(dir)) {
        await callback("");
    }
    else {
        const dirEntries = await fs.readdir(dir, { withFileTypes: true });
        await Promise.all(dirEntries.map(async (entry) => {
            if (entry.isDirectory()) {
                getFiles(path.join(dir, entry.name), async (fileName) => await callback(path.join(entry.name, fileName)));
            }
            else
                await callback(entry.name);
        }));
    }
}
export async function writeFile(filePath, content) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
}
export async function readFile(filePath) {
    return (await fs.readFile(filePath)).toString();
}
export async function deleteAll(path) {
    await fs.rm(path, { recursive: true, force: true });
}
export async function isFile(path) {
    const stat = await fs.stat(path).catch(e => null);
    if (stat)
        return stat.isFile();
    return false;
}
export async function isDirectory(path) {
    const stat = await fs.stat(path).catch(e => null);
    if (stat)
        return stat.isDirectory();
    return false;
}
