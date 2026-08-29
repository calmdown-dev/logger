import { S_LOGGER } from "./marker";
import type { Logger } from "./types";

/**
 * Type guard function checking whether an arbitrary provided values is a Logger instance.
 */
export function isLogger<TPayload = unknown>(value: unknown): value is Logger<TPayload> {
	return (
		value !== null &&
		typeof value === "object" &&
		(value as Logger<unknown>)[S_LOGGER] === true
	);
}

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
		: safeStringifyJson(payload);
}

/**
 * Safely converts any value into JSON. Quietly skips cyclic references and any unsupported types.
 * BigInts are converted to strings.
 */
export function safeStringifyJson(value: unknown, space?: string | number) {
	const refs = new WeakSet();
	const replacer = (_key: string, value: unknown) => {
		switch (typeof value) {
			case "object":
				if (value === null) {
					return null;
				}

				if (refs.has(value)) {
					return undefined;
				}

				refs.add(value);
				return value;

			case "bigint":
				return value.toString();

			case "function":
			case "symbol":
				return undefined;

			default:
				return value;
		}
	};

	return JSON.stringify(value, replacer, space);
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
