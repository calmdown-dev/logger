import type { TimeFormatter } from "~/types";
import { intToStringPad2 } from "~/utils";

export interface DateTimePartFormatter {
	(date: Date, offsetMinutes: number): string;
}

export const DateTimePart = (<T extends Record<string, DateTimePartFormatter>>(m: T) => m)({
	yyyy: date => "" + date.getFullYear(),
	M: date => "" + (date.getUTCMonth() + 1),
	MM: date => intToStringPad2(date.getUTCMonth() + 1),
	d: date => "" + date.getUTCDate(),
	dd: date => intToStringPad2(date.getUTCDate()),
	H: date => "" + date.getUTCHours(),
	HH: date => intToStringPad2(date.getUTCHours()),
	m: date => "" + date.getUTCMinutes(),
	mm: date => intToStringPad2(date.getUTCMinutes()),
	s: date => "" + date.getUTCSeconds(),
	ss: date => intToStringPad2(date.getUTCSeconds()),
	zzz: (_date, offset) => isoOffset(offset),
	u: (date, offset) => date.toISOString().slice(0, -1) + isoOffset(offset),
});

export interface DateTimeFormatterOptions {
	readonly parts?: readonly (DateTimePartFormatter | string)[];
	readonly timeZoneOffsetMinutes?: number;
}

/**
 * Creates a TimeFormatter capable of formatting Unix epoch millisecond timestamps into any
 * string-representations of date, time, timezone etc.
 */
export function createDateTimeFormatter(options: DateTimeFormatterOptions = {}): TimeFormatter {
	const {
		parts = [ DateTimePart.u ],
		timeZoneOffsetMinutes = 0,
	} = options;

	const count = parts.length;
	return timestamp => {
		const date = new Date(timestamp + timeZoneOffsetMinutes);

		let result = "";
		let index = 0;
		let part;

		for (; index < count; ++index) {
			part = parts[index];
			result += typeof part === "string" ? part : part(date, timeZoneOffsetMinutes);
		}

		return result;
	};
}

function isoOffset(minutes: number) {
	return minutes === 0
		? "Z"
		: `${minutes < 0 ? "-" : "+"}${intToStringPad2(minutes / 60)}:${intToStringPad2(minutes % 60)}`;
}
