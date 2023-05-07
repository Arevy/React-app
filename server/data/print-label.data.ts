import axios, { AxiosRequestConfig } from "axios";

import { getAxiosErrorMessage } from "@client/helpers/utils";
import { Logger } from "@server/services/logger.service";

import { removePassword } from "./utils-data";

export const printLabel = async (
	{
		orderReference,
	}: {
		orderReference: string;
	},
	headers: AxiosRequestConfig["headers"]
) => {
	const orderId = orderReference;
	const shippingLabelServiceURL = process.env.SHIPPING_LABEL_GENERATOR_URL!;

	const requestConfig = {
		method: "post",
		url: shippingLabelServiceURL,
		headers: removePassword(headers),
		data: { orderId },
	};

	try {
		Logger.debug(`shipping label service call [STARTED]`, { requestConfig });

		const response = await axios<string>(shippingLabelServiceURL, {
			...requestConfig,
			headers,
		});

		// TODO: remove this hack
		let shippingLabel = response.data;

		(() => {
			const originalUrl = new URL(process.env.SHIPPING_LABEL_GENERATOR_URL!);
			const responseUrl = new URL(shippingLabel);

			if (originalUrl.origin !== responseUrl.origin) {
				shippingLabel = shippingLabel.replace(
					responseUrl.origin,
					originalUrl.origin
				);
			}
		})();

		Logger.debug(`shipping label service call [DONE]`, {
			requestConfig,
			shippingLabel,
		});
		return shippingLabel;
	} catch (error) {
		const { message, statusCode } = getAxiosErrorMessage(error);

		Logger.error("shipping label service call [FAILED]", {
			requestConfig,
			message,
			statusCode,
			error,
		});
	}
};
