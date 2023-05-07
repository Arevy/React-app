import express from "express";

import {
	ciVersion,
	loggingService,
	shippingLabelsProxy,
} from "@server/services";

export const SERVICES_ENDPOINTS = {
	ci_version: "/ci-version",
	logs: "/logs",
	shipping_labels: "/shipping-labels",
};

export function servicesRouter() {
	const router = express.Router();

	router.get(SERVICES_ENDPOINTS.ci_version, ciVersion);
	router.get(SERVICES_ENDPOINTS.logs, loggingService);
	router.get(SERVICES_ENDPOINTS.shipping_labels, shippingLabelsProxy);

	return router;
}
