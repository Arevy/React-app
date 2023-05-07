import { AxiosRequestConfig } from "axios";
import dayjs from "dayjs";
import _, { create } from "lodash";

import { inspectJSON } from "@client/helpers/utils";
import { getOpenHours } from "@client/hooks/useIsStoreOpen";
import {
	Address,
	Customer,
	Order,
	OrderStatuses,
	Order_MinimalDetails,
	Product,
	VendorDetails,
} from "@client/stores";
import {
	DB_CUSTOM_ENTRIES,
	Onport_Purchase,
	Onport_PurchaseItem,
	Onport_VariantNames,
} from "@server/interfaces";
import { Logger } from "@server/services/logger.service";

import { OrderStatusActions } from "./order-status.data";

export async function parseOrder(
	purchase: Onport_Purchase,
	headers: AxiosRequestConfig["headers"],
	vendorDetails: VendorDetails
) {
	const { id, purchase_items, createdAt } = purchase;

	const time_now = dayjs().toISOString();

	try {
		if (!id || !purchase_items || !createdAt) {
			throw "parseOrder - the order is missing one of the following: id|purchase_items|createdAt";
		}

		const dates = (await getTransformedDates(purchase)) || { changes: {} };
		const status = purchase.purchase_status.name;

		const minimalOrder: Order_MinimalDetails = {
			id,
			onportReference: purchase.reference,
			status,
			dates,
			onport_statuses: {
				cancellationStatus: purchase.cancellationStatus,
				inventoryStatus: purchase.inventoryStatus,
			},
		};

		const minimalOrder_initial = _.cloneDeep(minimalOrder);
		let orderCancelled = false;

		if (minimalOrder.dates.received?.received_at) {
			/**
			 * ORDER ALREADY RECEIVED - skip step
			 */
			/**
			 * If the store is closed and it already received an order,
			 * the store will still see the order and have to either accept it or it will time out
			 */
		} else {
			receiveOrder(minimalOrder, vendorDetails);
		}

		if ([OrderStatuses.Pending, OrderStatuses.Picking].includes(status)) {
			/**
			 * cancel the order if accept/picking times have passed
			 **/
			const orderTimeoutReason = hasOrderTimedOut(minimalOrder, vendorDetails);

			if (orderTimeoutReason) {
				minimalOrder.dates.rejection_reason = orderTimeoutReason;
				minimalOrder.dates.changes.last_status = minimalOrder.status;
				minimalOrder.dates.changes.timedout_at = time_now;
				minimalOrder.status = OrderStatuses.Timedout;

				orderCancelled = true;
			}
		}

		const statusChanged = minimalOrder_initial.status !== minimalOrder.status;
		const datesChanged = !_.isEqual(minimalOrder_initial, minimalOrder);

		if (statusChanged && datesChanged) {
			const order = minimalOrder;
			await OrderStatusActions.changeOrderStatusAndDates({ order }, headers);
		} else if (datesChanged) {
			await OrderStatusActions.changeOrderDates(minimalOrder, headers);
		} else if (statusChanged) {
			await OrderStatusActions.changeOrderStatus(minimalOrder, headers);
		}

		if (orderCancelled || !minimalOrder.dates.received?.received_at) {
			return null;
		}

		const order: Order = {
			...minimalOrder,

			shipping_details: {
				courier: undefined, // TODO
				user_details: getTransformedCustomerInfo(purchase),
			},
			products: getTransformedProducts(purchase_items),

			// @ts-ignore - used just to check what the api returns // TODO - should be removed when the api is stable
			purchase,
		};
		return order;
	} catch (error) {
		Logger.error(`parseOrder - could not resolve order with id: ${id}`, {
			error,
			purchase,
		});
		return null;
	}
}

/**
 * compute user info
 */
function getTransformedCustomerInfo(purchase: Onport_Purchase) {
	try {
		const { sale } = purchase;
		const { email, phone, name, firstName, lastName } = sale.customer;

		const billing_address: Address | null = {
			email,
			phonenumber: phone,
			firstname: firstName,
			lastname: lastName,
		};

		const {
			shippingAddressMessage,
			shippingAddressLineOne,
			shippingAddressLineTwo,
			shippingCity,
			shippingCountry,
			shippingFirstName,
			shippingFullName,
			shippingLastName,
			shippingZip,
			invalidShippingAddress,
		} = purchase;

		const shipping_address: Address | null = invalidShippingAddress
			? null
			: {
					address: shippingAddressLineOne,
					address2: shippingAddressLineTwo,
					address_message: shippingAddressMessage?.valueOf.toString() || "", // FIXME - onport gives boolean | null
					phonenumber: phone,
					email,
					fullname: shippingFullName,
					firstname: shippingFirstName,
					lastname: shippingLastName,
					city: shippingCity,
					country: shippingCountry,
					zipcode: shippingZip,
			  };

		return {
			id: 0,
			firstName: shippingFirstName || firstName,
			lastName: shippingLastName || lastName,

			billing_address,
			shipping_address,
		} as Customer;
	} catch (e) {
		throw `at getTransformedCustomerInfo() :: ${e}`;
	}
}

/**
 * compute products
 */
function getTransformedProducts(purchase_items: Onport_PurchaseItem[]) {
	try {
		const products: Product[] = [];
		purchase_items!.forEach((item) => {
			// console.log(inspectJSON(item));
			let id;
			try {
				id = item.id;
				const { name, price, quantity, variant } = item;

				const {
					barcode,
					images,
					sku,
					vendor,
					option_values,
					custom_field_variants,
				} = variant;

				const { color_option, size } = (function () {
					let color, size;
					option_values.forEach((option_value) => {
						if (option_value.option.name == Onport_VariantNames.COLOR) {
							color = option_value.variantValue;
						}

						if (
							option_value.option.name == Onport_VariantNames.SIZE ||
							option_value.option.name == Onport_VariantNames.SIZE_GR
						) {
							size = option_value.variantValue;
						}
					});

					return { color_option: color, size };
				})();

				const { color_customField } = (function () {
					let color;
					const shopify_color_customField = "color_details";
					const shopify_color_customField_extract = "color_name_english";

					const potentialShopifyColor = custom_field_variants.find(
						(field) => field.custom_field.name == shopify_color_customField
					)?.value;
					if (potentialShopifyColor) {
						try {
							//{"color_name_english":"White","color_name_secondary":"Άσπρο","color_hex_code":"#FFFFFF","print_image_name":""}
							type PotentialShopifyColor = {
								color_name_english: string;
								color_name_secondary: string;
								color_hex_code: string;
								print_image_name: string;
							};
							color = (
								JSON.parse(potentialShopifyColor) as PotentialShopifyColor
							).color_name_english;

							if (!color) {
								throw "";
							}
						} catch (e) {
							Logger.warn(
								`getTransformedProducts() :: could not extract color`,
								{
									details: `shopify custom field found <${shopify_color_customField}> but <${shopify_color_customField_extract}> inside was not`,
									potentialShopifyColor,
								}
							);
						}
					}
					return { color_customField: color };
				})();

				const product: Product = {
					order_details: {
						barcode,
						color: color_customField || color_option,
						price: {
							amount: price?.toString() || "",
							currency: "NIS" /* "EUR" */,
						},
						quantity: quantity,
						size,
					},
					sku,
					tx_details: {
						sku,
						brand: vendor.name,
						image: (images as string[])?.[0] || "",
						media_gallery: [],
						name,
						url: "",
					},
				};

				products.push(product);
			} catch (e) {
				throw `${e} :: at product: id: ${id}; full ${inspectJSON(item)}`;
			}
		});

		return products;
	} catch (e) {
		throw `getTransformedProducts() :: ${e}`;
	}
}

/**
 * compute order dates
 */
async function getTransformedDates(purchase: Onport_Purchase) {
	try {
		const time_now = dayjs().toISOString();
		const { custom_field_purchases, createdAt = time_now } = purchase;

		const dbEntry = custom_field_purchases?.find(
			(entry) => entry.custom_field.name == DB_CUSTOM_ENTRIES.DATES && entry
		)?.object;
		const orderDates = dbEntry as unknown as Order["dates"];

		if (orderDates && orderDates.createdAt && orderDates.changes) {
			return orderDates;
		} else {
			const initialOrderDates: Order["dates"] = { createdAt, changes: {} };
			return initialOrderDates;
		}
	} catch (error) {
		throw `getTransformedDates() :: ${error}`;
	}
}

/**
 * 1. if a new order (status: Pending) is received while the store is open:
 * 	- cancel the order
 * 	- if the store is closed, wait until the store is open next
 *
 * 2. if an accepted order (status: Picking) has it's picking time passed
 * 	- cancel the order
 */

const OrderTimeoutdReasons = {
	ORDER_TOO_OLD: "Order too old.",
	PENDING_ORDER_TIMEOUT: "Pending Order - acceptance time expired.",
	PICKING_ORDER_TIMEOUT: "Picking Order - picking time expired.",
};
function hasOrderTimedOut(
	order: Order_MinimalDetails,
	vendorDetails: VendorDetails
) {
	const time_current = dayjs();

	/**
	 * check if order is too old
	 * - if more than 10 days have passed - cancel the order
	 * */
	const time_orderTooOldAt = dayjs(order.dates.createdAt).add(
		vendorDetails.time.time_days_to_cancel || 10,
		"days"
	);
	if (dayjs(time_orderTooOldAt).diff(time_current) < 0) {
		return OrderTimeoutdReasons.ORDER_TOO_OLD;
	}

	/**
	 * don't timeout orders that haven't been yet received
	 **/
	if (!order.dates.received?.received_at) {
		return;
	}

	/**
	 * timeout order if accepting time exceeded
	 **/
	if (order.status == OrderStatuses.Pending) {
		if (dayjs(order.dates.received.can_accept_until).diff(time_current) < 0) {
			return OrderTimeoutdReasons.PENDING_ORDER_TIMEOUT;
		}
	}

	/**
	 * timeout order if picking time exceeded
	 **/
	if (order.status == OrderStatuses.Picking) {
		if (
			!order.dates.changes?.accepted?.can_pick_until ||
			dayjs(order.dates.changes?.accepted.can_pick_until).diff(time_current) < 0
		) {
			return OrderTimeoutdReasons.PICKING_ORDER_TIMEOUT;
		}
	}
}

function receiveOrder(
	minimalOrder: Order_MinimalDetails,
	vendorDetails: VendorDetails
) {
	/**
	 * NEW ORDER - it has not been seen by the store yet -- initialize the order in onport
	 * - if store is closed - set: received_while_closed = true
	 * - if store is open - set: txOrderDates: { received_at, can_accept_until }
	 **/
	const time_now = dayjs().toISOString();

	const isStoreOpen = getOpenHours(
		vendorDetails.country_code || "gr", // FIXME - ensure country_code exists
		vendorDetails.time.time_acceptance_hours
	).getState();

	if (isStoreOpen) {
		/**
		 * @received_at
		 *
		 * if received while store is open
		 *   - onport createdAt is when the order is considered received by the store
		 * if received while store is closed
		 *   - the current time is when the order is considered received by the store
		 */
		const received_at = minimalOrder.dates.received_while_closed_at
			? time_now
			: minimalOrder.dates.createdAt;

		const timebomb_when_received_at = vendorDetails.time.time_accept_order;
		const can_accept_until = dayjs(received_at)
			.add(timebomb_when_received_at, "minutes")
			.toISOString();

		minimalOrder.dates.received = {
			received_at,
			can_accept_until,
			timebomb_when_received_at,
		};
	} else {
		/**
		 * the store is closed and the time when it received the order is tracked here
		 */
		minimalOrder.dates.received_while_closed_at = time_now;
	}
}
