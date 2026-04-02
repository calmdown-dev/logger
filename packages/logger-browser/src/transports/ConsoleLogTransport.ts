import { createPlainTextLogFormatter, LogSeverity, noop, type LogFormatter, type LogTransport } from "@calmdown/logger";

export interface ConsoleLike {
	log(...args: string[]): void;
	trace(...args: string[]): void;
	debug(...args: string[]): void;
	info(...args: string[]): void;
	warn(...args: string[]): void;
	error(...args: string[]): void;
}

export interface ConsoleLogTransportOptions<TPayload> {
	readonly console?: ConsoleLike;
	readonly minSeverity?: LogSeverity;
	readonly formatter?: LogFormatter<TPayload, string | (readonly string[])>;
}

declare namespace globalThis {
	const console: ConsoleLike;
}

/**
 * Creates a LogTransport that logs incoming LogMessages using the native console.
 */
export function createConsoleLogTransport<TPayload>(options: ConsoleLogTransportOptions<TPayload> = {}) {
	const { console: out = globalThis.console } = options;
	const callbackMap: Record<number, ((...args: string[]) => void) | undefined> = {
		[LogSeverity.Trace]: out.trace,
		[LogSeverity.Debug]: out.debug,
		[LogSeverity.Info]: out.info,
		[LogSeverity.Warn]: out.warn,
		[LogSeverity.Error]: out.error,
	};

	const transport: LogTransport<TPayload, string | (readonly string[])> = {
		formatter: options.formatter ?? createPlainTextLogFormatter(),
		minSeverity: options.minSeverity ?? LogSeverity.Info,
		close: noop,
		handle: message => {
			const callback = callbackMap[message.severity] ?? out.log;
			const args = transport.formatter(message);
			callback.apply(out, Array.isArray(args) ? args : [ args ]);
		},
	};

	return transport;
}
