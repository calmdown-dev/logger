import type { Logger } from "~/types";
import { noop } from "~/utils";

/**
 * A no-op Logger implementation that will drop any logs passed to it.
 *
 * `getLogger` calls will also return NoOpLogger; `label` is set to an empty string.
 */
export const NoOpLogger: Logger<any> = {
	label: "",
	getLogger: () => NoOpLogger,
	log: noop,
	trace: noop,
	debug: noop,
	info: noop,
	warn: noop,
	error: noop,
};
