import { createWriteStream, type PathLike } from "node:fs";
import type { Writable } from "node:stream";

import { createPlainTextLogFormatter, LogSeverity, type LogFormatter, type LogTransport } from "@calmdown/logger";

export type WritableData = Buffer | Uint8Array | string;

export interface WritableLogTransportOptions<TPayload> {
	readonly closeStream?: boolean;
	readonly formatter?: LogFormatter<TPayload, WritableData>;
	readonly minSeverity?: LogSeverity;
	readonly writable: Writable;
}

/**
 * Creates a LogTransport that outputs into an arbitrary Writable stream.
 */
export function createWritableLogTransport<TPayload>(
	options: WritableLogTransportOptions<TPayload>,
) {
	const {
		closeStream = true,
		writable,
	} = options;

	const transport: LogTransport<TPayload, WritableData> = {
		formatter: options.formatter ?? createPlainTextLogFormatter(),
		minSeverity: options.minSeverity ?? LogSeverity.Info,
		close: () => (
			closeStream
				? new Promise<void>(resolve => { writable.end(resolve) })
				: Promise.resolve()
		),
		handle: message => {
			if (!writable.errored) {
				// We ignore the return value of write, because buffering and overflow handling is
				// already implemented in Node's streams
				writable.write(transport.formatter(message));
				writable.write("\n");
			}
		},
	};

	return transport;
}

export interface FileLogTransportOptions<TPayload> extends Omit<WritableLogTransportOptions<TPayload>, "writable"> {
	readonly path: PathLike;
}

/**
 * Creates a LogTransport that outputs into a file.
 */
export function createFileLogTransport<TPayload>(options: FileLogTransportOptions<TPayload>) {
	return createWritableLogTransport({
		...options,
		writable: createWriteStream(options.path),
	});
}

export interface StdOutLogTransportOptions<TPayload> extends Omit<WritableLogTransportOptions<TPayload>, "writable"> {}

/**
 * Creates a LogTransport that outputs into the process.stdout stream.
 */
export function createStdOutLogTransport<TPayload>(options: StdOutLogTransportOptions<TPayload>) {
	return createWritableLogTransport({
		...options,
		writable: process.stdout,
	});
}
