import axios, { AxiosRequestConfig } from "axios";

import { FrontendEndpointsTypes } from "@server/interfaces/frontend-api";

export class APIService {
	baseURL = "/api";

	public get<T>(url: string, config?: AxiosRequestConfig) {
		// TODO - set headers as needed
		const fullURL = `${this.baseURL}${url}`;

		return axios.get<T>(fullURL, config);
	}

	public post<T>(url: string, data: T, config?: AxiosRequestConfig) {
		// TODO - set headers as needed
		const fullURL = `${this.baseURL}${url}`;
		return axios.post(fullURL, data, config);
	}

	public put<T>(url: string, data: T, config?: AxiosRequestConfig) {
		// TODO - set headers as needed
		const fullURL = `${this.baseURL}${url}`;

		return axios.put(fullURL, data, config);
	}

	public async api<
		PATH extends keyof FrontendEndpointsTypes,
		PARAMS extends Parameters<FrontendEndpointsTypes[PATH]>[0],
		RESPONSE extends ReturnType<FrontendEndpointsTypes[PATH]>
	>(path: PATH, params?: PARAMS) {
		const url = `${this.baseURL}${path}`;
		axios.defaults.withCredentials = true;

		const response = await axios.post<RESPONSE>(url, params, {
			responseType: "json",
			// withCredentials: true,
		});

		return response;
	}
}
