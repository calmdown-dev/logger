import { createPlainTextLogFormatter, LogSeverity, type LogFormatter, type LogTransport } from "@calmdown/logger";

export interface DockRow {
	/** @internal */
	$isDirty: boolean;

	/**
	 * Gets or sets the text of this DockRow.
	 */
	text: string;
}

export interface Dock extends Iterable<DockRow> {
	/**
	 * Adds a new DockRow to this Dock, optionally with an initial text.
	 */
	add(initialText?: string): DockRow;

	/**
	 * Removes the provided DockRow from this Dock.
	 */
	remove(row: DockRow): void;

	/**
	 * Removes all DockRows from this Dock.
	 */
	removeAll(): void;
}

export interface StdOutWithDockLogTransport<TPayload> extends LogTransport<TPayload, string> {
	readonly dock: Dock;
}

export interface StdOutWithDockLogTransportOptions<TPayload> {
	readonly dockGap?: number;
	readonly formatter?: LogFormatter<TPayload, string>;
	readonly minSeverity?: LogSeverity;
	readonly trimMargin?: number;
}

/**
 * Creates a StdOutWithDockLogTransport. This transport outputs into the process stdout and provides
 * an interface to keep "sticky" docked rows at the bottom of the output at all times. These rows
 * can dynamically change their text throughout runtime.
 */
export function createStdOutWithDockLogTransport<TPayload>(
	options: StdOutWithDockLogTransportOptions<TPayload>,
) {
	const dockGap = Math.max(options.dockGap ?? 1, 0);
	const trimMargin = Math.max(options.trimMargin ?? 5, 0);
	const rows: DockRow[] = [];

	let cursor = -dockGap;
	let dirtyIndex = 0;
	let isPendingUpdate = false;
	let lineBuffer = "";

	const onUpdate = () => {
		const rowCount = rows.length;
		const maxLength = process.stdout.columns - trimMargin;

		let cmd = "";
		let clearDown = "\u001b[0J";
		let clearLine = "\u001b[2K";

		if (lineBuffer.length > 0) {
			cmd += cursorMove(-cursor - dockGap) + "\r" + clearDown + lineBuffer;
			lineBuffer = "";
			dirtyIndex = 0;

			cursor = -dockGap;
			clearDown = "";
			clearLine = "";
		}

		for (let i = 0; i < rowCount; ++i) {
			const row = rows[i];
			if (row.$isDirty || i >= dirtyIndex) {
				cmd += cursorMove(i - cursor) + "\r" + clearLine + trimContent(row.text, maxLength) + "\n";
				row.$isDirty = false;

				cursor = i + 1;
			}
		}

		cmd += cursorMove(rowCount - cursor) + clearDown;
		process.stdout.write(cmd, "utf8");

		cursor = rowCount;
		dirtyIndex = rowCount;
		isPendingUpdate = false;
	};

	const scheduleUpdate = () => {
		if (!isPendingUpdate) {
			isPendingUpdate = true;
			process.nextTick(onUpdate);
		}
	};

	const onResize = () => {
		dirtyIndex = 0;
		scheduleUpdate();
	};

	process.on("SIGWINCH", onResize);

	const transport: StdOutWithDockLogTransport<TPayload> = {
		formatter: options.formatter ?? createPlainTextLogFormatter(),
		minSeverity: options.minSeverity ?? LogSeverity.Info,
		dock: {
			[Symbol.iterator]: () => rows[Symbol.iterator](),
			add: (initialText = "") => {
				let text = initialText;
				const row: DockRow = {
					$isDirty: true,
					get text() {
						return text;
					},
					set text(newText) {
						if (text !== (text = sanitizeContent(newText))) {
							row.$isDirty = true;
							scheduleUpdate();
						}
					},
				};

				rows.push(row);
				scheduleUpdate();
				return row;
			},
			remove: row => {
				const index = rows.indexOf(row);
				if (index === -1) {
					return;
				}

				rows.splice(index, 1);
				dirtyIndex = Math.min(dirtyIndex, index);
				scheduleUpdate();
			},
			removeAll: () => {
				if (rows.length > 0) {
					rows.length = 0;
					dirtyIndex = 0;
					scheduleUpdate();
				}
			}
		},
		close: () => {
			process.off("SIGWINCH", onResize);
		},
		handle: message => {
			const log = transport.formatter(message) + "\n";
			if (!isPendingUpdate && rows.length === 0) {
				process.stdout.write(log);
			}
			else {
				lineBuffer += log;
				scheduleUpdate();
			}
		}
	};

	return transport;
}

function cursorMove(offset: number) {
	const dist = Math.trunc(Math.abs(offset));
	return dist > 0 ? `\u001b[${dist}${offset < 0 ? "A" : "B"}` : "";
}

function sanitizeContent(content: string) {
	return ("" + content).replace(/[\r\n]+/g, " ");
}

function trimContent(content: string, maxLength: number) {
	let index = 0;
	let count = 0;

	while (index < content.length && count < maxLength) {
		if (isSurrogatePairAt(content, index)) {
			index += 2;
		}
		else {
			++index;
		}

		++count;
	}

	return content.slice(0, index);
}

function isSurrogatePairAt(content: string, index: number) {
	return (
		(content.charCodeAt(index) & 0xFC00) === 0xD800 &&
		(content.charCodeAt(index + 1) & 0xFC00) === 0xDC00
	);
}
