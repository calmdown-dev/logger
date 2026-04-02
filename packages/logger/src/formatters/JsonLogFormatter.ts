import type { LogFormatter } from "~/types";

import { defaultStringifySeverity } from "./internal/defaultStringifySeverity";

export interface JsonReplacer {
	(this: any, key: string, value: any): any;
}

export interface JsonLogFormatterOptions {
	readonly onReplaceJson?: JsonReplacer;
	readonly onTransformSeverity?: (severity: number) => any;
}

/**
 * Creates a LogFormatter that stringifies every LogMessage into a JSON string. Suitable for logging
 * into `.jsonl` files.
 */
export function createJsonLogFormatter(options: JsonLogFormatterOptions = {}): LogFormatter<any, string> {
	const {
		onReplaceJson,
		onTransformSeverity = defaultStringifySeverity,
	} = options;

	return message => JSON.stringify(
		{
			timestamp: new Date(message.timestamp),
			label: message.label,
			severity: onTransformSeverity(message.severity),
			payload: message.payload,
		},
		onReplaceJson,
	);
}
