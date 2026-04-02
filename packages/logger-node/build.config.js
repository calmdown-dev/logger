import * as Target from "build-logic/targets";

Target.TypeScriptLibrary.build(target => {
	target.entry("index", "./src/index.ts");
	target.configure({
		external: [
			/^node:/,
			"@calmdown/logger",
		],
	});
});
