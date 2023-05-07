import axios, {
	AxiosError,
	AxiosRequestConfig,
	ParamsSerializerOptions,
} from "axios";
import _ from "lodash";
import QueryString from "qs";

import { getAxiosErrorMessage, sleep } from "@client/helpers/utils";
import { Logger } from "@server/services/logger.service";

export const ONPORT_RATE_LIMITER = 1200;
export const paramsSerializer: ParamsSerializerOptions = {
	serialize: (params) =>
		QueryString.stringify(params, { encodeValuesOnly: true }),
};

export function removePassword(config: any) {
	const requestConfig = _.cloneDeepWith(config, (value, key) => {
		if (key == "password") {
			return value.replace(/./gm, "*");
		}
		if (key == "Authorization") {
			return `***${value.substring(value.length - 10)}`;
		}
	});

	return JSON.stringify(requestConfig) || undefined;
}

export async function makeOnportCall<T>(
	config: AxiosRequestConfig,
	logExtras?: object
) {
	await sleep(ONPORT_RATE_LIMITER);

	const requestConfig = {
		method: config.method,
		url: config.url,
		headers: removePassword(config.headers),
		params: config.paramsSerializer?.serialize
			? config.paramsSerializer.serialize(config.params)
			: undefined,
		data: removePassword(config.data),
	};

	if (!requestConfig.params) delete requestConfig.params;
	if (!requestConfig.data) delete requestConfig.data;

	const t = Date.now();
	process.env.LOG_ONPORT_STARTED === "true" &&
		Logger.debug(`onport call [STARTED]`, { requestConfig, logExtras });

	try {
		const response = await (await axios<T>(config)).data;

		process.env.LOG_ONPORT_DONE === "true" &&
			Logger.debug(`onport call [DONE]`, {
				requestConfig,
				response:
					process.env.LOG_ONPORT_RESPONSES === "true"
						? response
						: "LOG_ONPORT_RESPONSES is not true",
				done_in: Date.now() - t,
				logExtras,
			});

		return response;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const { message, statusCode } = getAxiosErrorMessage(error);

			Logger.error("onport call [FAILED]", {
				message,
				statusCode,
				requestConfig,
				error,
				failed_in: Date.now() - t,
				logExtras,
			});

			throw error as AxiosError<T>;
		} else {
			Logger.error("onport call [FAILED]", {
				error,
				requestConfig,
				failed_in: Date.now() - t,
				logExtras,
			});
		}

		throw error;
	}
}
