import { S_LOGGER } from "~/marker";
import type { Logger } from "~/types";
import { noop } from "~/utils";

/**
 * A no-op Logger implementation that will drop any logs passed to it.
 *
 * `getLogger` calls will also return NoOpLogger; `label` is set to an empty string.
 */
const NoOpLogger: Logger<any> = {
	[S_LOGGER]: true,
	label: "",
	origin: null!,
	getLogger: () => NoOpLogger,
	log: noop,
	trace: noop,
	debug: noop,
	info: noop,
	warn: noop,
	error: noop,
};

(NoOpLogger as any).origin = NoOpLogger;

export { NoOpLogger };
