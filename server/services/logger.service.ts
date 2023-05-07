import chalk from "chalk";
import winston from "winston";
import { Loggly } from "winston-loggly-bulk";
import Transport from "winston-transport";

export enum Winston_LogLevels {
	emerg = "red",
	alert = "red",
	crit = "red",
	error = "red",
	warning = "orange",
	notice = "yellow",
	info = "blue",
	debug = "green",
}

winston.addColors(Winston_LogLevels);

class CustomTransport extends Transport {
	logs: any[];
	constructor(logs: any[]) {
		super();
		this.logs = logs;
	}
	log(info: any, callback: Function) {
		this.logs.push(info);

		callback();
	}
}

export class Logger {
	private static instance?: Logger;

	static getInstance = () => {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}

		return Logger.instance;
	};

	private logger: winston.Logger;

	static getLogs() {
		return Logger.getInstance().logs;
	}

	private logs: any[] = [];

	constructor() {
		Logger.instance = this;

		const { createLogger, transports } = winston;
		const { combine, timestamp, json, printf } = winston.format;
		const myFormat = printf(({ level, message, timestamp, ...meta }) => {
			return `[${timestamp}] :: ${chalk.bgBlue(
				` ${message} `
			)} :: [${level}] :: meta: ${JSON.stringify(meta)}`;
		});

		const extra = [];
		if (process.env.LOGGLY_TOKEN && process.env.ENVIRONMENT !== "localdev") {
			extra.push(
				new Loggly({
					token: process.env.LOGGLY_TOKEN,
					subdomain: "terminalx",
					timestamp: true,
					json: true,
				})
			);
		}
		this.logger = createLogger({
			level: "debug",
			format: combine(timestamp(), json()),
			transports: [
				new CustomTransport(this.logs),
				new transports.Console({
					format: combine(
						timestamp(),
						winston.format.colorize(),
						// format.simple()
						myFormat
					),
				}),
				...extra,
			],
		});
	}

	static debug(message: string, details: object) {
		Logger.getInstance().logger.debug(message, {
			...details,
			env: process.env.ENVIRONMENT || "localdev",
		});
	}
	static info(message: string, details: object) {
		Logger.getInstance().logger.info(message, {
			...details,
			env: process.env.ENVIRONMENT || "localdev",
		});
	}
	static notice(message: string, details: object) {
		Logger.getInstance().logger.notice(message, {
			...details,
			env: process.env.ENVIRONMENT || "localdev",
		});
	}
	static warn(message: string, details: object) {
		Logger.getInstance().logger.warn(message, {
			...details,
			env: process.env.ENVIRONMENT || "localdev",
		});
	}
	static error(message: string, details: object) {
		Logger.getInstance().logger.error(message, {
			...details,
			env: process.env.ENVIRONMENT || "localdev",
		});
	}
}
