import axios, { AxiosRequestConfig } from "axios";
import cors from "cors";
import express, { Request } from "express";
import _ from "lodash";

import { COOKIES } from "@client/context/config";
import { getAxiosErrorMessage } from "@client/helpers/utils";
import {
	OrderStatusActions,
	getCouriers,
	getVendorActiveOrders,
	getVendorPastOrders,
	printLabel,
	vendorLogin,
} from "@server/data";
import { FrontendEndpointsKeys } from "@server/interfaces/frontend-api";
import { Logger } from "@server/services/logger.service";

export type FrontendEndpoint<P> = (req: Request, params: P) => any;

export const FrontendEndpoints = {
	"/print-label": printLabel,

	"/vendor/login": vendorLogin,
	"/vendor/couriers": getCouriers,
	// "/vendor/details": getVendorDetails,
	"/vendor/active-orders": getVendorActiveOrders,
	"/vendor/past-orders": getVendorPastOrders,

	"/order/change-status-or-dates": OrderStatusActions.changeOrderStatusAndDates,
};

export function frontendRouter() {
	const router = express.Router();

	Object.entries(FrontendEndpoints).forEach(([endpoint, caller]) =>
		router.post(endpoint, cors(), async (req, res) => {
			const params = req.body as Parameters<typeof caller>;
			const vendor_token = req.cookies[COOKIES.vendor_token] as string;
			const vendorId = req.cookies[COOKIES.vendorID] as string;
			const companyId = req.cookies[COOKIES.vendorCompanyID] as string;

			const req_url = req.url as FrontendEndpointsKeys;

			try {
				const requestHeaders: AxiosRequestConfig["headers"] = {
					Authorization: `Bearer ${vendor_token}`,
					"Content-Type": "application/json",
					"TX-Vendor-ID": vendorId,
					"TX-Company-ID": companyId,
				};

				const response = await (caller as any).apply(null, [
					params,
					requestHeaders,
				]); // FIXME any - seems unnecessary to fix

				if (req_url === "/vendor/login") {
					const _response = response as Awaited<ReturnType<typeof vendorLogin>>;
					const date = new Date();
					const expiryDays = 100;
					const oneDayInMillis = 24 * 60 * 60 * 1000;
					date.setTime(date.getTime() + expiryDays * oneDayInMillis);

					return res
						.cookie(COOKIES.vendorCompanyID, _response.companyId, {
							expires: date,
						})
						.cookie(COOKIES.vendor_token, _response.token, { expires: date })
						.cookie(COOKIES.vendorID, _response.dropshipProviderId, {
							expires: date,
						})
						.send("ok");
				}

				res.send(response);
			} catch (error) {
				let errorCode = 500;
				let errorMessage: unknown = `failed request to ${req.url}`;

				if (axios.isAxiosError(error)) {
					const { message, statusCode } = getAxiosErrorMessage(error);

					errorCode = statusCode || 500;
					errorMessage = message;
				}

				Logger.error(`frontend router - ${errorMessage}`, {
					api_url: req.url,
					errorCode,
					errorMessage,
					error,
				});

				return res
					.status(errorCode)
					.set("Content-Type", "text/plain")
					.send(errorMessage)
					.end();
			}
		})
	);

	return router;
}
