import axios from "axios";
import { makeAutoObservable, toJS } from "mobx";

import RootContext from "@client/context/RootContext";
import { getAxiosErrorMessage, inspectJSON } from "@client/helpers/utils";
import { Courier, Order, OrderStatuses, VendorDetails } from "@client/stores";

import { computeDates } from "./vendor-store.helpers";

export class VendorStore {
	pullingDataInProgress = false;

	couriers: Courier[] = [];
	activeOrders: Order[] = [];
	pastOrders: Order[] = [];
	vendorDetails: VendorDetails | undefined = undefined;

	pollingInterval?: ReturnType<typeof setInterval>;

	printingModals?: any;

	constructor(private rootContext: RootContext) {
		makeAutoObservable(this);
	}

	public initialise = async () => {
		if (process.env.REACT_APP_IS_CLIENT) {
			await import("@client/helpers/printing-modals").then(
				(PrintingModals) =>
					(this.printingModals = new PrintingModals.default(this.rootContext))
			);
		}

		await this.getVendorAndActiveOrders();
		// await this.getPastOrders();
		// await this.getCouriers();

		this.startPollingInterval();
	};

	private startPollingInterval() {
		this.pollingInterval = setInterval(
			this.getVendorAndActiveOrders,
			Number(process.env.REACT_APP_VENDOR_STORE_POLLING_INTERVAL) * 1000
		);
	}

	public setOrderStatus = async (
		orderID: number,
		newStatusName: OrderStatuses,
		rejection_reason?: Order["dates"]["rejection_reason"]
	) => {
		this.rootContext.logger.trace("setting order status", {
			orderID,
			newStatusName,
			rejection_reason,
		});

		const order = this.activeOrders.find((order) => order.id == orderID);

		if (!order) {
			this.rootContext.logger.error("Could not find order.", orderID);

			return;
		}

		try {
			order.dates.changes.last_status = order.status;
			order.status = newStatusName;

			order.dates = computeDates(order, this.vendorDetails!, rejection_reason);

			if (order.status == OrderStatuses.Packed) {
				// if order will be Packed, open the modal while the label is being generated
				this.printingModals?.openPrintingModal(
					process.env.REACT_APP_TIMEOUT_PRINT_GENERATE_LABEL
				);
			}

			const data = await (
				await this.rootContext.apiService.api("/order/change-status-or-dates", {
					order,
				})
			).data;

			if (order.status == OrderStatuses.Packed) {
				// after order is actually Packed in onport, label should be generated for "order.onportReference"
				this.printShippingLabel(order.onportReference);
			}

			// TODO - (maybe) make sure the result has set the correct values in onport, or retry
			// (await response.data).shipmentResult;
		} catch (error) {
			this.rootContext.logger.error("Error while changing the order status", {
				error,
				order,
			});

			if (axios.isAxiosError(error)) {
				const { message, statusCode } = getAxiosErrorMessage(error) || {};

				this.rootContext.modalStore.showError(
					`There was an error while changing the order (${orderID}) status.`,
					`Error code: ${statusCode}; error message: ${message}`
				);
			}
		}
	};

	public getVendorAndActiveOrders = async () => {
		if (this.pullingDataInProgress) {
			return;
		}

		this.pullingDataInProgress = true;

		try {
			const response = await this.rootContext.apiService.api(
				"/vendor/active-orders"
			);
			const data = await response.data;
			const { orders, vendorDetails } = data;
			this.activeOrders = orders;
			this.vendorDetails = vendorDetails;
		} catch (error) {
			const errMsg = "Could not get orders and vendor details.";
			const { message, statusCode } = getAxiosErrorMessage(error);

			this.rootContext.modalStore.showFullscreenError(
				`${errMsg} \n\n ${message} (HTTP status: ${statusCode})`
			);

			this.rootContext.logger.error(
				`VendorStore:getActiveOrders() - ${errMsg}`,
				{ error }
			);
		}

		this.pullingDataInProgress = false;
	};

	public async printShippingLabel(orderReference: string) {
		this.printingModals?.openPrintingModal();

		try {
			const pdfRes = await this.rootContext.apiService.api("/print-label", {
				orderReference,
			});

			const pdf = await pdfRes.data;
			const printerSettings =
				toJS(this.rootContext.vendorStore.vendorDetails?.printer) || {};

			const webViewMessage = { pdf, ...printerSettings };

			window.webkit.messageHandlers.printMessageHandler.postMessage(
				webViewMessage
			);
		} catch (e) {
			const err = (e as object) || {};
			this.printingModals?.donePrinting(
				"Could not print",
				"Are you using the iPad app?",
				inspectJSON(err)
			);
		}
	}

	// private async getPastOrders() {
	// 	const response = await this.rootContext.apiService.api(
	// 		"/vendor/past-orders"
	// 	);

	// 	this.pastOrders = await response.data;
	// }

	// private async getCouriers() {
	// 	const response = await this.rootContext.apiService.api("/vendor/couriers");
	// 	this.couriers = await response.data;
	// }
}
