import { createLogger, format, Logger, transports } from "winston";

const {colorize, combine, simple, timestamp} = format;

export const logger: Logger = createLogger(
{
	format: combine (colorize(), simple(), timestamp()),
	level: "debug",
	transports: [new transports.Console()],
});
