import { createDateTimeFormatter, LogSeverity, toStringOrJson, type LogFormatter, type TimeFormatter } from "@calmdown/logger";

import { Ansi16, type AnsiColorSystem, type RgbColor } from "~/utils/AnsiColorSystem";

export enum ColorExtent {
	HeaderOnly,
	EntireLine,
}

export interface AnsiColorSeverityInfo {
	readonly extent: ColorExtent;
	readonly name: string;
	readonly color: RgbColor;
}

export interface AnsiColorLogFormatterOptions<TPayload> {
	readonly colorSystem?: AnsiColorSystem;
	readonly onMapSeverity?: (severity: LogSeverity) => AnsiColorSeverityInfo;
	readonly onStringifyPayload?: (payload: TPayload) => string;
	readonly timeFormatter?: TimeFormatter;
}

/**
 * Creates a LogFormatter with ANSI color support.
 */
export function createAnsiColorLogFormatter<TPayload>(
	options: AnsiColorLogFormatterOptions<TPayload> = {},
): LogFormatter<TPayload, string> {
	const {
		colorSystem = Ansi16,
		onMapSeverity = defaultMapSeverity,
		onStringifyPayload = toStringOrJson,
		timeFormatter = createDateTimeFormatter(),
	} = options;

	return message => {
		const severity = onMapSeverity(message.severity);
		const header = `[${timeFormatter(message.timestamp)}][${severity.name}][${message.label}]: `;
		switch (severity.extent) {
			case ColorExtent.HeaderOnly:
				return `${colorSystem.text(severity.color)}${header}${colorSystem.reset}${onStringifyPayload(message.payload)}`;

			case ColorExtent.EntireLine:
				return `${colorSystem.text(severity.color)}${header}${onStringifyPayload(message.payload)}${colorSystem.reset}`;
		}
	};
}

const KNOWN_SEVERITIES: Record<number, AnsiColorSeverityInfo | undefined> = {
	[LogSeverity.Trace]: {
		extent: ColorExtent.HeaderOnly,
		name: "TRACE",
		color: 0xa0a0a0,
	},
	[LogSeverity.Debug]: {
		extent: ColorExtent.HeaderOnly,
		name: "DEBUG",
		color: 0xa742ff,
	},
	[LogSeverity.Info]: {
		extent: ColorExtent.HeaderOnly,
		name: "INFO",
		color: 0x309fff,
	},
	[LogSeverity.Warn]: {
		extent: ColorExtent.HeaderOnly,
		name: "WARN",
		color: 0xffab2e,
	},
	[LogSeverity.Error]: {
		extent: ColorExtent.HeaderOnly,
		name: "ERROR",
		color: 0xff2e2e,
	},
};

function defaultMapSeverity(severity: LogSeverity) {
	return KNOWN_SEVERITIES[severity] ?? {
		extent: ColorExtent.HeaderOnly,
		name: `UNKNOWN:${severity}`,
		color: 0xff2e2e,
	};
}
