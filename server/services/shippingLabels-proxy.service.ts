import axios from "axios";
import { RequestHandler } from "express";

import { Logger } from "./logger.service";

export const shippingLabelsProxy: RequestHandler = async (req, res) => {
	const fileUrl = req.query.file as string;
	Logger.notice(`shippingLabelsProxy :: started printing`, {
		fileUrl,
	});

	const data = (
		await axios({
			url: fileUrl,
			method: "get",
			responseType: "stream",
		})
	).data;

	res.contentType("application/pdf");
	data.pipe(res);
};
