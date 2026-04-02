import { LogSeverity } from "~/LogSeverity";
import type { Lazy, LogDispatcher, LogMessage, Logger, RawLogCallback, TimeProvider } from "~/types";
import { joinLabels } from "~/utils";

interface InternalLogMessage<TPayload> extends LogMessage<TPayload> {
	$payloadValue?: TPayload;
	$payloadLazy?: Lazy<TPayload>;
}

const PAYLOAD_PROPERTY: PropertyDescriptor = {
	enumerable: true,
	configurable: false,
	get: function (this: InternalLogMessage<any>) {
		return (this.$payloadValue ??= this.$payloadLazy!());
	}
};

/** @internal */
export interface LoggerOptions<TPayload> {
	readonly $dispatcher: LogDispatcher<TPayload>;
	readonly $label: string;
	readonly $timeProvider: TimeProvider;
}

/** @internal */
export function createLogger<TPayload>(options: LoggerOptions<TPayload>): Logger<TPayload> {
	const {
		$dispatcher,
		$label,
		$timeProvider,
	} = options;

	const log: RawLogCallback<TPayload> = (severity, payload) => {
		const message = {
			severity,
			label: $label,
			timestamp: $timeProvider.now(),
		} as InternalLogMessage<TPayload>;

		if (typeof payload === "function") {
			message.$payloadLazy = payload as Lazy<TPayload>;
		}
		else {
			message.$payloadValue = payload;
		}

		Object.defineProperty(message, "payload", PAYLOAD_PROPERTY);
		$dispatcher.$dispatch(message);
	};

	return {
		label: $label,
		getLogger: subLabel => createLogger({
			$dispatcher,
			$timeProvider,
			$label: joinLabels($label, subLabel),
		}),
		log,
		trace: payload => log(LogSeverity.Trace, payload),
		debug: payload => log(LogSeverity.Debug, payload),
		info: payload => log(LogSeverity.Info, payload),
		warn: payload => log(LogSeverity.Warn, payload),
		error: payload => log(LogSeverity.Error, payload),
	};
}
