export interface TimeProvider {
	/**
	 * Returns the current time as Unix epoch milliseconds.
	 */
	readonly now: () => number;
}

export type Eager<T> = T extends (...a: any) => any ? never : T;
export type Lazy<T> = () => T;

export interface RawLogCallback<TPayload> {
	/**
	 * Logs the given payload with the specified severity. Typically members of the LogSeverity enum
	 * would be used, however any number can be used to e.g. define further fine-grained severities.
	 */
	(severity: number, payload: Eager<TPayload>): void;

	/**
	 * Logs the given lazy payload with the specified severity. Typically members of the LogSeverity
	 * enum would be used, however any number can be used to e.g. define further fine-grained
	 * severities.
	 *
	 * When the severity is not being logged by any transports (their minSeverity is too high), the
	 * payload callback will not be called.
	 *
	 * When at least one transport logs at this severity, the payload callback will be called. It is
	 * always called exactly once regardless of the number of transports.
	 */
	(severity: number, lazyPayload: Lazy<TPayload>): void;

	/** @internal */
	(severity: number, anyPayload: Eager<TPayload> | Lazy<TPayload>): void;
}

export interface LogCallback<TPayload> {
	/**
	 * Logs the given payload with a severity this callback belongs to.
	 */
	(payload: Eager<TPayload>): void;

	/**
	 * Logs the given lazy payload with a severity this callback belongs to.
	 *
	 * When the severity is not being logged by any transports (their minSeverity is too high), the
	 * payload callback will not be called.
	 *
	 * When at least one transport logs at this severity, the payload callback will be called. It is
	 * always called exactly once regardless of the number of transports.
	 */
	(lazyPayload: Lazy<TPayload>): void;

	/** @internal */
	(anyPayload: Eager<TPayload> | Lazy<TPayload>): void;
}

export interface Logger<TPayload> {
	/**
	 * Gets the label of this Logger.
	 */
	readonly label: string;

	/**
	 * Gets the LoggerFactory used to create sub-loggers of this Logger.
	 */
	readonly getLogger: LoggerFactory<TPayload>;

	/**
	 * Gets the RawLogCallback of this Logger capable of dynamically specifying log severity.
	 */
	readonly log: RawLogCallback<TPayload>;

	/**
	 * Gets the LogCallback of this Logger logging at the LogSeverity.Trace severity.
	 */
	readonly trace: LogCallback<TPayload>;

	/**
	 * Gets the LogCallback of this Logger logging at the LogSeverity.Debug severity.
	 */
	readonly debug: LogCallback<TPayload>;

	/**
	 * Gets the LogCallback of this Logger logging at the LogSeverity.Info severity.
	 */
	readonly info: LogCallback<TPayload>;

	/**
	 * Gets the LogCallback of this Logger logging at the LogSeverity.Warn severity.
	 */
	readonly warn: LogCallback<TPayload>;

	/**
	 * Gets the LogCallback of this Logger logging at the LogSeverity.Error severity.
	 */
	readonly error: LogCallback<TPayload>;
}

export interface LoggerFactory<TPayload> {
	/**
	 * Creates a new Logger with the specified label. When used in nested Loggers, a sub-logger is
	 * created with the new label appended to the parent Logger's label.
	 */
	(label: string): Logger<TPayload>;
}

export interface Closeable {
	/**
	 * Closes this Closeable releasing all resources it may be using.
	 */
	readonly close: () => Promise<void> | void;
}

export interface LogMessage<TPayload> {
	/**
	 * Gets the time at which this LogMessage has been logged as Unix epoch milliseconds.
	 */
	readonly timestamp: number;

	/**
	 * Gets the severity of this LogMessage.
	 */
	readonly severity: number;

	/**
	 * Gets the label of the Logger that produced this LogMessage.
	 */
	readonly label: string;

	/**
	 * Gets the payload of this LogMessage.
	 */
	readonly payload: TPayload;
}

export interface LogFormatter<TPayload, TOutput> {
	/**
	 * Formats the provided LogMessage to TOutput.
	 */
	(message: LogMessage<TPayload>): TOutput;
}

export interface LogTransport<TPayload, TOutput> extends Closeable {
	/**
	 * Gets or sets the LogFormatter used to format LogMessages being passed through this
	 * LogTransport.
	 */
	formatter: LogFormatter<TPayload, TOutput>;

	/**
	 * Gets or sets the minimum severity a LogMessage must have to be passed through this
	 * LogTransport.
	 */
	minSeverity: number;

	/**
	 * Handles an incoming LogMessage to be written to the appropriate output this LogTransport
	 * represents.
	 */
	readonly handle: (message: LogMessage<TPayload>) => void;
}

export interface LogTransportAddCallback<TPayload> {
	/**
	 * Attempts to add the provided LogTransport to the LogTransportCollection. Only unique
	 * transports can be added to the collection and thus repeated attempts to add the same
	 * transport will have no effect.
	 * @returns a boolean indicating whether the transport was added.
	 */
	(transport: LogTransport<TPayload, any>): boolean;
}

export interface LogTransportRemoveCallback<TPayload> {
	/**
	 * Attempts to remove the provided LogTransport from the LogTransportCollection.
	 * @returns a boolean indicating whether the transport was removed.
	 */
	(transport: LogTransport<TPayload, any>): boolean;
}

export interface LogTransportCollection<TPayload> extends Iterable<LogTransport<TPayload, any>> {
	/**
	 * Attempts to add the provided LogTransport to this LogTransportCollection. Only unique
	 * transports can be added to the collection and thus repeated attempts to add the same
	 * transport will have no effect.
	 * @returns a boolean indicating whether the transport was added.
	 */
	readonly add: LogTransportAddCallback<TPayload>;

	/**
	 * Attempts to remove the provided LogTransport from this LogTransportCollection.
	 * @returns a boolean indicating whether the transport was removed.
	 */
	readonly remove: LogTransportRemoveCallback<TPayload>;
}

export interface LogDispatcher<TPayload> extends Closeable {
	/**
	 * Gets the LogTransportCollection containing the LogTransports used by this LogDispatcher.
	 */
	readonly transports: LogTransportCollection<TPayload>;

	/**
	 * Gets the LoggerFactory used to create loggers dispatching through this LogDispatcher.
	 */
	readonly getLogger: LoggerFactory<TPayload>;

	/** @internal */
	readonly $dispatch: (message: LogMessage<TPayload>) => void;
}

export interface TimeFormatter {
	/**
	 * Formats a Unix epoch millisecond timestamp to string.
	 */
	(timestamp: number): string;
}
