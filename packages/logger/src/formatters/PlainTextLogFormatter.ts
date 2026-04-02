import { createDateTimeFormatter } from "~/formatters/DateTimeFormatter";
import type { LogFormatter, TimeFormatter } from "~/types";
import { toStringOrJson } from "~/utils";

import { defaultStringifySeverity } from "./internal/defaultStringifySeverity";

export interface PlainTextLogFormatterOptions<TPayload> {
	readonly onStringifyPayload?: (payload: TPayload) => string;
	readonly onStringifySeverity?: (severity: number) => string;
	readonly timeFormatter?: TimeFormatter;
}

/**
 * Creates a LogFormatter that converts every LogMessage into a string.
 */
export function createPlainTextLogFormatter<TPayload>(
	options: PlainTextLogFormatterOptions<TPayload> = {},
): LogFormatter<TPayload, string> {
	const {
		onStringifyPayload = toStringOrJson,
		onStringifySeverity = defaultStringifySeverity,
		timeFormatter = createDateTimeFormatter(),
	} = options;

	return message => `[${timeFormatter(message.timestamp)}][${onStringifySeverity(message.severity)}][${message.label}]: ${onStringifyPayload(message.payload)}`;
}
