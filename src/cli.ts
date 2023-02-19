import { logError, style } from "./error.js";
import { compileMacros, Options } from "./index.js";
const args = process.argv.slice(2);

function main() {
	const options: Options = { srcDir: args.shift() ?? "", clean: true };
	if (["--help", "-h"].includes(options.srcDir) || !options.srcDir) {
		showHelp();
		return;
	}

	const flags = parseFlags(["--target", "-t", "--rootdir", "-r", "--clean", "-c"]);
	if (!flags) return;

	if (flags["--target"].length % 2 != 0) flags.target.length.push("");
	const targets = [...flags["--target"], ...flags["-t"]];
	if (targets.length) {
		options.targets = [];
		for (let i = 0; i < targets.length; i += 2) {
			options.targets.push({
				name: targets[i],
				dstDirectory: targets[i + 1],
			});
		}
	}

	const rootDir = [...flags["--rootdir"], ...flags["-r"]];
	options.rootDir = rootDir.shift();
	if (rootDir.length > 0) {
		if (rootDir.length == 2) logError(`Invalid argument '${rootDir[0]}'`);
		else logError(`Invalid arguments '${rootDir.join(" ")}'`);
		return;
	}

	const cleanArray = [...flags["--clean"], ...flags["-c"]];
	const clean = cleanArray.shift();
	if (cleanArray.length > 0) {
		if (rootDir.length == 2) logError(`Invalid argument '${cleanArray}'`);
		else logError(`Invalid arguments '${cleanArray.join(" ")}'`);
		return;
	}
	
	if (clean) {
		if (["false", "f", "0"].includes(clean)) options.clean = false;
		else if (!["true", "t", "1"].includes(clean)) {
			logError(`Invalid argument '${clean}'`);
			return;
		}
	}

	compileMacros(options);
}

function parseFlags(validFlags: string[]): any | null {
	const flags: any = {};

	for (const flagName of validFlags) {
		flags[flagName] = [];
	}

	let currentFlag: string | null = null;

	for (const arg of args) {
		const flag = arg.toLowerCase();
		if (validFlags.includes(flag)) currentFlag = flag;
		else if (currentFlag) flags[currentFlag].push(arg);
		else if (["--help", "-h"].includes(flag)) return showHelp();
		else return logError(`Invalid argument '${arg}'`);
	}

	return flags;
}


const helpMessage = `
${style.bold}Usage:${style.reset}  macro-compiler [source directory/file] [optional-flags]

${style.bold}Example:${style.reset}  macro-compiler src-folder -t NodeJs nodejs/src Browser browser/src

${style.bold}Flags:${style.reset}
  ${style.blue} --target, -t${style.reset}  Set the compilation targets
     arguments:  <name> <directory> <name> <directory> ...
       default:  NodeJs NodeJs/src Browser Browser/src

  ${style.blue}--rootDir, -r${style.reset}  Specify the root folder
     arguments:  <root-directory>
       default:  current-directory

    ${style.blue}--clean, -c${style.reset}  Delete the target directories before compilation
     arguments:  false/true
       default:  true
`;

function showHelp() {
	console.log(helpMessage);
}

main();