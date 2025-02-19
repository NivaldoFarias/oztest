import Bun from "bun";

if (import.meta.main) {
	const script = Bun.argv.slice(2)[0];

	const result = await Bun.build({
		entrypoints: ["./src/scripts/" + script + ".ts"],
		target: "node",
		minify: true,
		sourcemap: "external",
		banner: `
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import process from 'node:process';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

globalThis.require = require;
globalThis.process = process;
globalThis.__filename = __filename;
globalThis.__dirname = __dirname;
`,
	});

	if (!result.success) {
		console.error("Build failed:", result.logs);
		process.exit(1);
	}

	await Bun.write("./dist/" + script + ".js", result.outputs[0]);
}
