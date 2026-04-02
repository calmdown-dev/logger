/**
 * An enumeration of commonly used log severities.
 *
 * Additional severities can be used for more fine-grained levels as the library treats severities
 * as ordinary numbers. However, keep in mind that all LogFormatters are defaulted with these (and
 * only these) severities and any extra levels will require additional configuration to be formatted
 * correctly.
 */
export enum LogSeverity {
	Trace = 100,
	Debug = 200,
	Info = 300,
	Warn = 400,
	Error = 500,
	Off = 1_000_000,
}
