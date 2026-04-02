import type { LogDispatcher, LogTransport, TimeProvider } from "~/types";

import { createLogger } from "./createLogger";

export interface LogDispatcherOptions {
	readonly timeProvider: TimeProvider;
}

/**
 * Creates a LogDispatcher.
 */
export function createLogDispatcher<TPayload>(options: LogDispatcherOptions) {
	const transports = new Set<LogTransport<TPayload, any>>();
	let isClosing = false;

	const dispatcher: LogDispatcher<TPayload> = {
		transports: {
			[Symbol.iterator]: () => transports[Symbol.iterator](),
			remove: transport => transports.delete(transport),
			add: transport => {
				const prevSize = transports.size;
				transports.add(transport);
				return transports.size > prevSize;
			}
		},
		getLogger: $label => createLogger({
			$dispatcher: dispatcher,
			$label,
			$timeProvider: options.timeProvider
		}),
		close: async () => {
			isClosing = true;
			const results = await Promise.allSettled(
				Array.from(transports).map(transport => transport.close()),
			);

			const firstRejected = results.find(result => result.status === "rejected") as PromiseRejectedResult | undefined;
			if (firstRejected) {
				throw firstRejected.reason;
			}
		},
		$dispatch: message => {
			if (!isClosing) {
				transports.forEach(transport => {
					if (message.severity >= transport.minSeverity) {
						transport.handle(message);
					}
				});
			}
		}
	};

	return dispatcher;
}
