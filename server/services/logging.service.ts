import { RequestHandler } from "express";

import { Logger } from "./logger.service";

export const loggingService: RequestHandler = (req, res, next) => {
	return res.send(Logger.getLogs());
};
