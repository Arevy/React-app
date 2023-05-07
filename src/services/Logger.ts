import RootContext from "@client/context/RootContext";

type LogEntry = {
	message: string;

	details: any;
	timestamp: string;
	log_level: LOG_LEVELS;
};

export enum LOG_LEVELS {
	TRACE = 0,
	DEBUG = 1,
	INFO = 2,
	WARN = 3,
	ERROR = 4,
}

export class Logger {
	logs: LogEntry[] = [];
	errors: LogEntry[] = [];

	// TODO - externalize LOG_LEVEL as env variable
	LOG_LEVEL =
		(process.env.REACT_APP_IS_CLIENT
			? process.env.REACT_APP_LOG_LEVEL_FRONTEND
			: process.env.REACT_APP_LOG_LEVEL_BACKEND) || LOG_LEVELS.DEBUG;

	constructor(private rootContext: RootContext) {}

	trace(message: string, details: any) {
		this.log(message, details, LOG_LEVELS.TRACE);
	}
	debug(message: string, details: any) {
		this.log(message, details, LOG_LEVELS.DEBUG);
	}
	info(message: string, details: any) {
		this.log(message, details, LOG_LEVELS.INFO);
	}
	warn(message: string, details: any) {
		this.log(message, details, LOG_LEVELS.WARN, "\u001b[33m");
	}
	error(message: string, details: any) {
		this.log(message, details, LOG_LEVELS.ERROR, "\x1b[31m");
	}

	private log(
		message: string,
		details: any,
		log_level: LOG_LEVELS,
		customColor?: string
	) {
		const timestamp = new Date().toISOString();
		if (!process.env.REACT_APP_IS_CLIENT) {
			// TODO - send client info to backend
			this.logs.unshift({ message, details, timestamp, log_level });
		}

		const logger =
			log_level == LOG_LEVELS.ERROR
				? console.error
				: log_level == LOG_LEVELS.WARN
				? console.warn
				: console.log;

		log_level >= this.LOG_LEVEL &&
			logger(
				customColor || "\x1b[36m",
				`[${LOG_LEVELS[log_level]}] [${timestamp}] ${message} :: `,
				details
			);
	}
}
