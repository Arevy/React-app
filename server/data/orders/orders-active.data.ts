import { AxiosRequestConfig } from "axios";
import { map as PromiseMap } from "bluebird";
import { makeOnportCall, paramsSerializer } from "server/data/utils-data";

import { inspectJSON } from "@client/helpers/utils";
import { Order, OrderStatuses, VendorDetails } from "@client/stores";
import {
	Onport_CustomField,
	Onport_CustomFieldPurchase,
	Onport_CustomField_Variant,
	Onport_Purchase,
	Onport_PurchaseItem,
} from "@server/interfaces";
import OnportStatusMappings from "@server/services/cronjobs/status-mappings";
import { Logger } from "@server/services/logger.service";

import { getVendorDetails } from "../vendor.data";
import { parseOrder } from "./orders.helpers";

export async function getVendorActiveOrders(
	{ vendorDetails }: { vendorDetails: VendorDetails },
	headers: AxiosRequestConfig["headers"]
) {
	/**
	 * use param vendorDetails only for the timebombs cron job
	 *
	 * if vendorDetails is undefined, it means that @getVendorActiveOrders was called through the frontend
	 */
	let _vendorDetails: VendorDetails | undefined = vendorDetails;
	if (!vendorDetails) {
		try {
			_vendorDetails = (await getVendorDetails({}, headers)) as VendorDetails;
		} catch (error) {
			throw error;
		}
	}

	if (!_vendorDetails) {
		throw `could not get vendor details ${inspectJSON(_vendorDetails || {})}`;
	}

	// console.log(_vendorDetails.identifier);
	// return { vendorDetails, orders: [] };

	try {
		const purchases = await getVendorActiveOrders_request(headers);

		if (purchases) {
			const orders = await PromiseMap(
				purchases,
				async (item) => parseOrder(item, headers, _vendorDetails!),
				{ concurrency: 1 }
			);

			return {
				vendorDetails: _vendorDetails,
				orders: orders.filter((order) => !!order) as Order[],
			};
		}
	} catch (error) {
		Logger.error("orders-active.data", { error });
		// TODO - improve error handling for client
		// @ts-ignore
		return { vendorDetails: _vendorDetails, orders: [] };
	}

	return { vendorDetails: _vendorDetails, orders: [] as Order[] };
}

async function getVendorActiveOrders_request(
	headers: AxiosRequestConfig["headers"]
) {
	// TODO - don't show order when it is already inactive

	const params = {
		// scope: "customFields",

		limit: 100,
		from: 0, // TODO: pagination

		// scope: "export",
		where: {
			purchaseStatusId: {
				$in: [
					OnportStatusMappings.mapStatusNameToID(
						OrderStatuses.Pending,
						headers!["TX-Company-ID"]
					),
					OnportStatusMappings.mapStatusNameToID(
						OrderStatuses.Picking,
						headers!["TX-Company-ID"]
					),
					OnportStatusMappings.mapStatusNameToID(
						OrderStatuses.Packed,
						headers!["TX-Company-ID"]
					),
				],
			},
		},
		attributes: [
			"id",
			"reference",
			"createdAt",
			"inventoryStatus",
			"cancellationStatus",
			"billingFirstName",
			"billingLastName",
			"billingFullName",
			"billingName",
			"purchaseStatusId", // *required - onport fails w/o
			"saleId", // *required - onport fails w/o
			// "cancelled", // TODO - open onport ticket <- cancelled is always false
			// "finalized",
			// "approved",
			// "dropshipProviderId",
			// "shipmentRouting",
		] as (keyof Onport_Purchase)[],
		include: [
			{
				model: "CustomFieldPurchase",
				attributes: [
					"value",
					"object",
					"id",
				] as (keyof Onport_CustomFieldPurchase)[],
				include: [
					{
						model: "CustomField",
						attributes: ["name"] as (keyof Onport_CustomField)[],
					},
				],
			},
			{
				model: "PurchaseItem",
				attributes: [
					"id",
					"name",
					"price",
					"quantity",
					"saleItemId",
					"variantId",
				] as (keyof Onport_PurchaseItem)[],
				include: [
					{
						model: "Variant",
						attributes: [
							"barcode",
							"images",
							"sku",
						] as (keyof Onport_PurchaseItem["variant"])[],
						include: [
							{
								model: "CustomFieldVariant",
								attributes: [
									"value",
									"object",
									"id",
								] as (keyof Onport_CustomField_Variant)[],
								include: [
									{
										model: "CustomField",
										attributes: ["name"] as (keyof Onport_CustomField)[],
									},
								],
							},
							{
								model: "OptionValue",
								attributes: [
									"variantValue",
								] as (keyof Onport_PurchaseItem["variant"]["option_values"][0])[],
								include: [
									{
										model: "Option",
										attributes: [
											"name",
										] as (keyof Onport_PurchaseItem["variant"]["option_values"][0]["option"])[],
									},
								],
							},
							{
								model: "Vendor",
								attributes: [
									"name",
								] as (keyof Onport_PurchaseItem["variant"]["vendor"])[],
							},
						],
					},
				],
			},
			{
				model: "Sale",
				attributes: [
					"taxShipping",
					"createdAt",
					"id",
					"saleId",
				] as (keyof Onport_Purchase["sale"])[],
				include: [
					{
						model: "SaleShippingRate",
					},
					{
						model: "Customer",
						// atrributes: ["email"] as (keyof Onport_Customer)[],
					},
				],
			},
			{
				model: "PurchaseStatus",
			},
		],
	};

	// Logger.info(
	// 	"orders-active.data - incoming purchases request",
	// 	{
	// 		serialized: paramsSerializer.serialize!(params),
	// 		params: JSON.stringify(params),
	// 	}
	// );

	return await makeOnportCall<Onport_Purchase[]>({
		method: "get",
		url: `https://api.jetti.io/api/purchases.json`,
		headers,
		params,
		paramsSerializer,
	});
}
