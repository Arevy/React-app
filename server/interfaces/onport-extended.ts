import { Order, OrderStatuses } from "@client/stores";

import { components, paths } from "./onport-generated";

export const STORE_SETTINGS_LABELS = {
	TIME_ACCEPTANCE_HOURS: "time_acceptance_hours",
	TIME_TO_ACCEPT_ORDER: "time_accept_order",
	TIME_TO_PICK_ORDER: "time_pick_order",
};

/**
 * global
 */

export type Onport_HasCompanyId = { companyId: number };

/**
 * vendor details
 */

export type Onport_VendorLoginResponse = components["schemas"]["user"] &
	Onport_HasCompanyId;
export type Onport_VendorDetails =
	components["schemas"]["dropship-provider"] & {
		custom_field_dropship_providers?: Onport_CustomFieldDropshipProvider[];
	};

/**
 * customer
 */

export type Onport_Customer = components["schemas"]["customer"];

/**
 * custom fields
 */

export enum DB_CUSTOM_ENTRIES {
	STATE = "txOrderState",
	DATES = "txOrderDates",
}
export type DB_CUSTOM_ENTRIES_MAPPING = {
	txOrderDates: Order["dates"];
};

/* #region custom fields */
export type Onport_CustomField = Partial<components["schemas"]["custom-field"]>;

export type Onport_CustomFieldDropshipProvider = {
	custom_field: Onport_CustomField;
} & Partial<components["schemas"]["custom-field-dropship-provider"]>;

export type Onport_CustomFieldPurchase = {
	custom_field: Onport_CustomField;
} & components["schemas"]["custom-field-purchase"];
export type Onport_SyncCustomFields_Purchase_Response = {
	instance: components["schemas"]["custom-field-purchase"];
	custom_field: Onport_CustomField;
}[];
export type Onport_Cancel_Purchase_Response =
	paths["/purchases/{id}/cancel.json"]["put"]["responses"]["200"]["content"]["application/json"] & {
		purchase: components["schemas"]["purchase"];
		sale_return_items: components["schemas"]["sale-return-item"][];
	};

/* #endregion */

/**
 * purchase item
 */

export const Onport_VariantNames = {
	COLOR: "Color",
	SIZE: "Size",
	SIZE_GR: "ΜΕΓΕΘΟΣ",
};

export type Onport_CustomField_Variant = {
	custom_field: Onport_CustomField;
} & components["schemas"]["custom-field-variant"];

export type Onport_PurchaseItem = {
	variant: {
		custom_field_variants: Onport_CustomField_Variant[];
		vendor: components["schemas"]["vendor"];

		option_values: ({
			option: components["schemas"]["option"];
		} & components["schemas"]["option-value"])[];
	} & components["schemas"]["variant"];
} & components["schemas"]["purchase-item"];

/**
 * purchase
 */

export type Onport_Statuses = (components["schemas"]["purchase-status"] &
	Onport_HasCompanyId)[];

export type Onport_PurchaseStatus = Omit<
	components["schemas"]["purchase-status"],
	"id"
> & {
	name: OrderStatuses;
};
const aaa = {} as Onport_PurchaseStatus;

export type Onport_Purchase = {
	custom_field_purchases?: Onport_CustomFieldPurchase[];

	purchase_items: Onport_PurchaseItem[];
	purchase_status: Onport_PurchaseStatus;
	sale: components["schemas"]["sale"] & { customer: Onport_Customer };
} & components["schemas"]["purchase"];
