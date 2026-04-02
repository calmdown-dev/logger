export type RgbColor = number;

export type AnsiColorSystem = ReturnType<typeof createSystem>;

/**
 * The ANSI 16 color system. Supported by nearly all terminals, but only provides the most basic 16
 * colors.
 */
export const Ansi16 = createSystem(
	color => `\u001b[${toAnsi16(color) + 10}m`,
	color => `\u001b[${toAnsi16(color)}m`,
);

/**
 * The ANSI 256 color system. Supported by most terminals. Provides 256 basic colors.
 */
export const Ansi256 = createSystem(
	color => `\u001b[48;5;${toAnsi256(color)}m`,
	color => `\u001b[38;5;${toAnsi256(color)}m`,
);

/**
 * The ANSI 16M color system. Only supported by modern terminals, but provides the full RGB spectrum
 * of colors (8 bits per channel).
 */
export const Ansi16m = createSystem(
	color => `\u001b[48;2;${toAnsi16m(color)}m`,
	color => `\u001b[38;2;${toAnsi16m(color)}m`,
);

function createSystem(back: (color: RgbColor) => string, text: (color: RgbColor) => string) {
	return Object.freeze({
		back,
		text,
		bold: "\u001b[1m",
		lowIntensity: "\u001b[2m",
		underline: "\u001b[4m",
		blinking: "\u001b[5m",
		inverse: "\u001b[7m",
		invisible: "\u001b[8m",
		reset: "\u001b[0m",
		resetBg: "\u001b[49m",
		resetFg: "\u001b[39m",
	});
}

function toAnsi16(color: RgbColor) {
	const { r, g, b } = getRgb(color);
	const index = (r > 100 ? 1 : 0) | (g > 100 ? 2 : 0) | (b > 100 ? 4 : 0);
	return (Math.max(r, g, b) > 200 ? 90 : 30) + index;
}

function toAnsi256(color: RgbColor) {
	const { r, g, b } = getRgb(color);
	return r === g && g === b
		? r < 5 ? 16 : r > 246 ? 231 : 232 + getIndex(r, 8, 238, 10)
		: 16 + 36 * getColorAnsi256(r) + 6 * getColorAnsi256(g) + getColorAnsi256(b);
}

function toAnsi16m(color: RgbColor) {
	const { r, g, b } = getRgb(color);
	return `${r};${g};${b}`;
}

function getRgb(color: RgbColor) {
	return {
		r: (color >> 16) & 0xff,
		g: (color >> 8) & 0xff,
		b: color & 0xff,
	};
}

function getIndex(channel: number, min: number, max: number, step: number) {
	return Math.round(((channel < min ? min : channel > max ? max : channel) - min) / step);
}

function getColorAnsi256(channel: number) {
	return channel < 48 ? 0 : 1 + getIndex(channel, 95, 255, 40);
}
