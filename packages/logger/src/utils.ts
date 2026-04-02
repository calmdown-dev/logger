/**
 * Concatenates two logger labels together with a "." (period) as a separator.
 */
export function joinLabels(currentLabel: string, subLabel: string) {
	return currentLabel + "." + subLabel;
}

/**
 * Truncates the value to an integer and converts it to a string. Numbers 0-9 are zero-padded to a
 * length of 2 characters.
 *
 * E.g. calling `intToStringPad2(3.14)` will return `"03"`
 */
export function intToStringPad2(value: number) {
	const str = "" + Math.trunc(value);
	return str.length >= 2 ? str : "0" + str;
}

/**
 * Passes strings as-is, any other data type is passed through JSON.stringify.
 */
export function toStringOrJson(payload: unknown) {
	return typeof payload === "string"
		? payload
		: JSON.stringify(payload);
}

/**
 * Gets the time zone offset (in minutes) of the machine-local time.
 */
export function getLocalTimeZoneOffset() {
	return new Date().getTimezoneOffset();
}

/**
 * A no-op function.
 */
export function noop() {
	// do nothing
}
