import { RequestHandler } from "express";

import { Logger } from "@server/services/logger.service";

function getDurationInMilliseconds(start: [number, number]) {
	const NS_PER_SEC = 1e9;
	const NS_TO_MS = 1e6;
	const diff = process.hrtime(start);

	return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
}

const do_not_log_paths = ["/services"];

const SERVER_REQUEST_LOG = "request time middleware";
export const requestTime: RequestHandler = (req, res, next) => {
	let shouldLog = true;
	do_not_log_paths.forEach((path) => {
		if (req.path.startsWith(path) || req.path == path) {
			shouldLog = false;
		}
	});

	if (shouldLog) {
		Logger.debug(`${SERVER_REQUEST_LOG} [STARTED]`, {
			method: req.method,
			url: req.originalUrl,
		});
		const start = process.hrtime();

		res.on("finish", () => {
			const durationInMilliseconds = getDurationInMilliseconds(start);
			Logger.debug(`${SERVER_REQUEST_LOG} [FINISHED]`, {
				method: req.method,
				url: req.originalUrl,
				done_in: durationInMilliseconds,
			});
		});

		res.on("close", () => {
			const durationInMilliseconds = getDurationInMilliseconds(start);
			Logger.debug(`${SERVER_REQUEST_LOG} [CLOSED]`, {
				method: req.method,
				url: req.originalUrl,
				done_in: durationInMilliseconds,
			});
		});
	}
	next();
};
