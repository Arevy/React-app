import { AxiosRequestConfig } from "axios";

import { inspectJSON } from "@client/helpers/utils";
import { OrderStatuses } from "@client/stores";
import { makeOnportCall } from "@server/data/utils-data";
import { Onport_Statuses } from "@server/interfaces";

type OnportEnvironment = {
	companyId: number;
	statuses: OnportStatuses;
};

export type OnportStatuses = { [key in OrderStatuses]: number };

export default class OnportStatusMappings {
	private static instance?: OnportStatusMappings;

	static getInstance() {
		if (!OnportStatusMappings.instance) {
			OnportStatusMappings.instance = new OnportStatusMappings();
		}

		return OnportStatusMappings.instance;
	}

	static mapStatusNameToID(name: OrderStatuses, companyId: number) {
		return this.getInstance().statuses.find(
			(companyStatuses) => companyStatuses.companyId == companyId
		)?.statuses[name];
	}

	constructor() {
		OnportStatusMappings.instance = this;
	}

	statuses: OnportEnvironment[] = [];

	getStatuses = async () => {
		await Promise.allSettled(
			["production", "development"].map(async (environment) => {
				let token;
				if (environment == "production") {
					token = process.env.ONPORT_MASTER_TOKEN_PROD;
				} else {
					token = process.env.ONPORT_MASTER_TOKEN_DEV;
				}

				const config: AxiosRequestConfig = {
					url: "https://api.jetti.io/api/purchase-statuses.json",
					method: "get",
					headers: {
						Authorization: `Bearer ${token}`, // admin
						"Content-Type": "application/json",
					},
				};

				const response = await makeOnportCall<Onport_Statuses>(config, {
					environment,
				});

				const mappedStatuses: { [key: string]: number } = {};

				Object.keys(OrderStatuses).forEach(
					(status) =>
						(mappedStatuses[status] = this.mapStatus(status, response))
				);

				this.statuses.push({
					companyId: response[0].companyId,
					statuses: mappedStatuses as OnportStatuses,
				});
			})
		);
	};

	private mapStatus(statusName: string, statuses: Onport_Statuses) {
		return statuses.find((status) => status.name == statusName)?.id || 0;
	}
}
