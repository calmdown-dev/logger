import { defineTarget, inProduction, inWatchMode } from "@calmdown/rolldown-workspace";

import * as Plugin from "./rolldown-plugins.js";

export const TypeScriptLibrary = defineTarget("TypeScriptLibrary", target => target
	.configure({
		platform: "neutral",
		tsconfig: "./tsconfig.json",
	})
	.pipeline("Code", pipe => pipe
		.plugin(Plugin.Delete
			.disable(inWatchMode)
			.configure({
				targets: "./dist/**/*",
			})
		)
		.plugin(Plugin.Declarations)
		.output("Main", out => out
			.configure(() => ({
				dir: "./dist",
				format: "es",
				minify: inProduction(),
				sourcemap: true,
			}))
		)
	)
);
