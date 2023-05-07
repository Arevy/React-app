import { AxiosRequestConfig } from "axios";

import { getAxiosErrorMessage } from "@client/helpers/utils";
import { OrderStatuses, Order_MinimalDetails } from "@client/stores";
import {
	DB_CUSTOM_ENTRIES,
	Onport_Cancel_Purchase_Response,
	Onport_SyncCustomFields_Purchase_Response,
	paths,
} from "@server/interfaces";
import OnportStatusMappings from "@server/services/cronjobs/status-mappings";
import { Logger } from "@server/services/logger.service";

import { makeOnportCall } from "../utils-data";

async function changeOrderStatusAndDates(
	{ order }: { order: Order_MinimalDetails },
	headers: AxiosRequestConfig["headers"]
) {
	Logger.debug("\r\n --- changeOrderStatusAndDates", {
		order,
	});

	const statusChanged = await changeOrderStatus(order, headers);
	const datesChanged = await changeOrderDates(order, headers);

	return { datesChanged, statusChanged };
}

async function changeOrderDates(
	{ id, dates }: Order_MinimalDetails,
	headers: AxiosRequestConfig["headers"]
) {
	Logger.debug("\r\n --- changeOrderDates", { id, dates });

	const data = {
		customFields: [{ key: DB_CUSTOM_ENTRIES.DATES, value: dates }],
	};

	try {
		const response =
			await makeOnportCall<Onport_SyncCustomFields_Purchase_Response>({
				method: "put",
				url: `https://api.jetti.io/api/purchases/${id}/sync-custom-fields.json`,
				headers,
				data,
			});
		return response;
	} catch (error) {
		// Logger.error("changeOrderStatus() - failed", { error });
	}
}

async function changeOrderStatus(
	order: Order_MinimalDetails,
	headers: AxiosRequestConfig["headers"]
) {
	Logger.debug("\r\n --- changeOrderStatus", { order });

	if (order.status == OrderStatuses.Packed) {
		try {
			await shipOrder({ order }, headers);
		} catch (error) {
			const { message } = getAxiosErrorMessage(error);
			const errorMessage = `Failed to change order status to "Ready".\n ${message}`;

			// Logger.error("changeOrderStatusAndDates() - call to shipOrder() failed", {
			// 	order,
			// 	errorMessage,
			// });

			throw errorMessage;
		}
		// TODO - implement delivery notification } else if (status == OrderStatus.Delivered) {
	}

	if (
		order.status == OrderStatuses.Timedout ||
		order.status == OrderStatuses.Rejected
	) {
		try {
			await cancelOrder({ order }, headers);
		} catch (error) {
			const { message } = getAxiosErrorMessage(error);
			const errorMessage = `Failed to cancel the order.\n ${message}`;

			// Logger.error(
			// 	"changeOrderStatusAndDates() - call to cancelOrder() failed",
			// 	{ order, errorMessage }
			// );

			throw error;
		}
	}

	try {
		const companyId = headers!["TX-Company-ID"] as number;
		const purchaseStatusId = OnportStatusMappings.mapStatusNameToID(
			order.status,
			companyId
		);

		if (purchaseStatusId) {
			await makeOnportCall<Onport_Cancel_Purchase_Response[]>({
				method: "put",
				url: `https://api.jetti.io/api/purchases/${order.id}.json`,
				headers,
				data: { purchaseStatusId },
			});
		} else
			throw `could not find purchaseStatusId | companyID: ${companyId} | purchaseStatusId: ${purchaseStatusId}`;
	} catch (error) {
		const { message } = getAxiosErrorMessage(error);
		const errorMessage = `Failed to change the order status.\n ${message}`;

		// Logger.error("changeOrderStatusAndDates() - call to change status failed", {
		// 	order,
		// 	errorMessage,
		// });

		throw error;
	}
}

async function shipOrder(
	{ order }: { order: Order_MinimalDetails },
	headers: AxiosRequestConfig["headers"]
) {
	Logger.debug("\r\n --- shipOrder", { order });

	if (
		order.onport_statuses.inventoryStatus == "shipped" ||
		order.onport_statuses.inventoryStatus == "received"
	) {
		return "already shipped";
	}
	return makeOnportCall<
		paths["/purchases/{id}/default-label.json"]["put"]["responses"]["200"]["content"]["application/json"]
	>({
		method: "put",
		url: `https://api.jetti.io/api/purchases/${order.id}/default-label.json`,
		headers,
		data: { inventoryStatus: "shipped", ids: [] },
	});
}

async function cancelOrder(
	{ order }: { order: Order_MinimalDetails },
	headers: AxiosRequestConfig["headers"]
) {
	Logger.debug("\r\n --- cancelOrder", { order });

	if (
		order.onport_statuses.cancellationStatus == "full" ||
		order.onport_statuses.cancellationStatus == "partial"
	) {
		return "already cancelled";
	}

	return await makeOnportCall<Onport_Cancel_Purchase_Response[]>({
		method: "put",
		url: `https://api.jetti.io/api/purchases/${order.id}/cancel.json`,
		headers,
		data: { ids: [], setQuantities: true, status: "cancelled" },
	});
}

export const OrderStatusActions = {
	changeOrderStatusAndDates,
	changeOrderDates,
	changeOrderStatus,
};
