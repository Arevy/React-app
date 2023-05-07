import { TDateISO } from "@client/interfaces";
import { Onport_Purchase, components } from "@server/interfaces";

export type OpeningHours = {
	from: string;
	to: string;
};

export type Price = {
	amount: string;
	currency: string;
};

export type OrderFulfillment = {
	minutes_to_accept: number;
	minutes_to_pick: number;
};

export type ShippingDetailsVendor = {
	address: string;
	address2: string;
	phonenumber: string;
	email: string;
	name: string;
};

export type ShippingDetailsOrder = {
	courier_ordered: CourierOrdered;
	customer: Customer;
	vendor: Address;
};

export type Customer = {
	id?: number | null;
	firstName?: string;
	lastName?: string;
	billing_address: Address | null;
	shipping_address: Address | null;
};
export type Address = {
	address?: string | null;
	address2?: string | null;
	address_message?: string | null;
	phonenumber?: string | null;
	email?: string | null;
	fullname?: Onport_Purchase["billingFullName"];
	firstname?: string | null;
	lastname?: string | null;
	city?: string | null;
	country?: string | null;
	zipcode?: string | null;
};

export type Courier = {
	name: string;
	phonenumber: number;
	price: Price;
	currency: string;
};
export type CourierOrdered = {
	courier: Courier;
	eta_in_store: TDateISO | null;
	eta_at_client: TDateISO | null;
};

export type MediaGallery = {
	id: number;
	image: string;
};

export type VendorDetails = {
	id: number;
	identifier: string;
	address: Address;
	country_code: string;

	/** store times configurations */
	time: {
		/** store opening hours */
		time_acceptance_hours: string;
		/** store's time to accept an order (minutes) */
		time_accept_order: number;
		/** store's time to pick an order (minutes) */
		time_pick_order: number;
		/**
		 * store's time until a pending/ picking order is automatically timedout
		 * - used when store is closed for a long time
		 **/
		time_days_to_cancel: number;
	};

	/** store printer settings */
	printer: {
		printer_bluetooth_serial?: string;
		printer_model?: string;
		print_orientation?: string;
		tape_width?: string;
		tape_length?: string;
		tape_gap?: string;
	};
};

export enum OrderStatuses {
	"Pending" = "Pending",
	"Picking" = "Picking",
	"Packed" = "Packed",
	"Shipped" = "Shipped",
	"Delivered" = "Delivered",
	"Rejected" = "Rejected",
	"Timedout" = "Timedout",
}

export type Order_MinimalDetails = {
	id: number;
	onportReference: string;

	status: OrderStatuses;
	onport_statuses: {
		// onport discrepancy "notReceived" | "partiallyReceived" | "received" OR "shipped"|"notShipped"
		inventoryStatus:
			| "notReceived"
			| "partiallyReceived"
			| "received"
			| "shipped"
			| "notShipped";

		cancellationStatus: components["schemas"]["purchase"]["cancellationStatus"];
	};
	dates: {
		/** onport createdAt */
		createdAt: string;

		/** time when an order is received while the store is closed */
		received_while_closed_at?: string;

		received?: {
			/** time when the order was received by the store's app, if store was open */
			readonly received_at: TDateISO;

			/** time until store can accept the order; defined when pulling data from DB, from received_at */
			readonly can_accept_until: TDateISO;
			/**
			 * vendorDetails.time.time_accept_order when order was received
			 * in case the current store's time_pick_order changes after initial accept */
			readonly timebomb_when_received_at: number;
		};

		// when an order is rejected, a rejection reason is supplied
		rejection_reason?: string;

		/** keep track of whenever the status of an order changes */
		changes: {
			accepted?: {
				/** time when the store accepted the order */
				readonly accepted_at: TDateISO;
				/** time until store can pick the products; defined when order is accepted, from can_accept_until */
				readonly can_pick_until: TDateISO;
				/**
				 * vendorDetails.time.time_pick_order when order was accepted
				 * in case the current store's time_pick_order changes after initial accept */
				readonly timebomb_when_accepted_at: number;
			};
			picking_done_at?: TDateISO;
			shipped_at?: TDateISO;
			received_by_customer_at?: TDateISO;
			timedout_at?: TDateISO;
			rejected_at?: TDateISO;

			last_status?: OrderStatuses;
		};
	};
};
export type Order = Order_MinimalDetails & {
	shipping_details: {
		user_details: Customer;
		courier?: CourierOrdered;
	};

	products: Product[];
};

export type ProductTXDetails = {
	sku: string;
	url: string;
	image: string;
	media_gallery: MediaGallery[];
	name: string;
	brand: string;
};

export type Product = {
	sku: string;
	order_details: {
		barcode?: string | null;
		size?: string | number | null;
		color?: string;
		price: Price;
		quantity: number;
	};
	tx_details: ProductTXDetails;
};
