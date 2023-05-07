import util from "util";

import axios from "axios";

export const inspectJSON = (obj: object, depth = 3) =>
	typeof obj === "string"
		? obj
		: util.inspect(obj, {
				showHidden: false,
				depth,
				colors: false,
				compact: true,
		  });

export function getAxiosErrorMessage(error: unknown) {
	if (!axios.isAxiosError(error)) return {};

	if (error.response) {
		// The request was made and the server responded with a status code
		// that falls out of the range of 2xx
		const { data, status } = error.response;

		return { message: data, statusCode: status };
	} else if (error.request) {
		// The request was made but no response was received
		// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
		// http.ClientRequest in node.js
		return {
			message: inspectJSON(error.request),
			statusCode: Number(error.code),
		};
	} else {
		// Something happened in setting up the request that triggered an Error
		const { message, code } = error;
		return { message, statusCode: Number(code) };
	}
}

export async function sleep(ms: number) {
	return await new Promise((resolve) => setTimeout(resolve, ms));
}
