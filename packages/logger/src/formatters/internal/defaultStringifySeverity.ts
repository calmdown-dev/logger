import { LogSeverity } from "~/LogSeverity";

const KNOWN_SEVERITIES: Record<number, string | undefined> = {
	[LogSeverity.Trace]: "TRACE",
	[LogSeverity.Debug]: "DEBUG",
	[LogSeverity.Info]: "INFO",
	[LogSeverity.Warn]: "WARN",
	[LogSeverity.Error]: "ERROR",
};

/** @internal */
export function defaultStringifySeverity(severity: number) {
	return KNOWN_SEVERITIES[severity] ?? `UNKNOWN:${severity}`;
}
