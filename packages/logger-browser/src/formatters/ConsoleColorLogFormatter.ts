import { createDateTimeFormatter, LogSeverity, toStringOrJson, type LogFormatter, type TimeFormatter } from "@calmdown/logger";

export enum StyleExtent {
	HeaderOnly,
	EntireLine,
}

export interface ConsoleColorSeverityInfo {
	readonly extent: StyleExtent;
	readonly style: string;
}

export interface ConsoleColorLogFormatterOptions<TPayload> {
	readonly onMapSeverity?: (severity: LogSeverity) => ConsoleColorSeverityInfo;
	readonly onStringifyPayload?: (payload: TPayload) => string;
	readonly timeFormatter?: TimeFormatter;
}

/**
 * Creates a LogFormatter with support for CSS-styled log messages. Suitable for use with the
 * ConsoleLogTransport.
 */
export function createConsoleColorLogFormatter<TPayload>(
	options: ConsoleColorLogFormatterOptions<TPayload> = {},
): LogFormatter<TPayload, string[]> {
	const {
		onMapSeverity = defaultMapSeverity,
		onStringifyPayload = toStringOrJson,
		timeFormatter = createDateTimeFormatter(),
	} = options;

	return message => {
		// This formatter is meant to be used with ConsoleTransport which handles severity by
		// calling appropriate console callbacks, so we don't need to include it in the header.
		const style = onMapSeverity(message.severity);
		const header = `[${timeFormatter(message.timestamp)}][${message.label}]: `;
		switch (style.extent) {
			case StyleExtent.HeaderOnly:
				return [ `%c${header}%c${onStringifyPayload(message.payload)}`, style.style, "" ];

			case StyleExtent.EntireLine:
				return [ `%c${header}${onStringifyPayload(message.payload)}`, style.style ];
		}
	};
}

const KNOWN_SEVERITIES: Record<number, ConsoleColorSeverityInfo | undefined> = {
	[LogSeverity.Trace]: {
		extent: StyleExtent.HeaderOnly,
		style: "color:#a0a0a0",
	},
	[LogSeverity.Debug]: {
		extent: StyleExtent.HeaderOnly,
		style: "color:#a742ff",
	},
	[LogSeverity.Info]: {
		extent: StyleExtent.HeaderOnly,
		style: "color:#309fff",
	},
	[LogSeverity.Warn]: {
		extent: StyleExtent.HeaderOnly,
		style: "color:#ffab2e",
	},
	[LogSeverity.Error]: {
		extent: StyleExtent.HeaderOnly,
		style: "color:#ff2e2e",
	},
};

const UNKNOWN_SEVERITY: ConsoleColorSeverityInfo = {
	extent: StyleExtent.HeaderOnly,
	style: "color:#ff2e2e",
};

function defaultMapSeverity(severity: LogSeverity) {
	return KNOWN_SEVERITIES[severity] ?? UNKNOWN_SEVERITY;
}
