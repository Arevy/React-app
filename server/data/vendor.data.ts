import { AxiosRequestConfig } from "axios";

import { DEFAULT_TIMES } from "@client/context/config";
import { VendorDetails } from "@client/stores";
import {
	Onport_CustomField,
	Onport_VendorDetails,
	STORE_SETTINGS_LABELS,
	components,
} from "@server/interfaces";

import { makeOnportCall, paramsSerializer } from "./utils-data";

type GetVendorDetailsParams = {
	returnAllVendors?: boolean;
};

export async function getVendorDetails(
	{ returnAllVendors }: GetVendorDetailsParams,
	headers: AxiosRequestConfig["headers"]
) {
	const companyId = headers!["TX-Company-ID"];
	const params = {
		// scope: "customFields",
		where: { companyId },
		attributes: [
			"id",
			"name",
			"userId",
			"externalId",
			"addressLineOne",
			"addressLineTwo",
			"shippingEmail",
			"shippingPhone",
			"phone",
			"city",
			"country",
			"zip",
		] as (keyof components["schemas"]["dropship-provider"])[],
		include: [
			{
				model: "CustomFieldDropshipProvider",
				attributes: [
					"value",
				] as (keyof components["schemas"]["custom-field-dropship-provider"])[],
				include: [
					{
						model: "CustomField",
						attributes: ["label"] as (keyof Onport_CustomField)[],
					},
				],
			},
		],
	};

	// TODO - find a more elegant method to retrieve the vendorID; maybe use the cookie?
	const vendorID = headers?.["TX-Vendor-ID"];

	// vendorID
	// ? `https://api.jetti.io/api/dropship-providers/${vendorID}.json`
	// : `https://api.jetti.io/api/dropship-providers.json`,;
	const vendorDetails = await makeOnportCall<Onport_VendorDetails[]>({
		method: "get",
		url: `https://api.jetti.io/api/dropship-providers.json`,
		headers,
		params,
		paramsSerializer,
	});

	const globalSettingsName = "1_global_settings";
	const globalSettingsStore = vendorDetails.filter(
		(vendor) => vendor.name == globalSettingsName
	)[0];

	if (returnAllVendors) {
		return vendorDetails.map((currentVendor) =>
			processCurrentVendor(currentVendor, globalSettingsStore)
		);
	}

	const currentVendor = vendorDetails.filter(
		(vendor) => vendor.id == vendorID
	)[0];

	return processCurrentVendor(currentVendor, globalSettingsStore);
}

function processCurrentVendor(
	currentVendor: Onport_VendorDetails,
	globalSettingsStore: Onport_VendorDetails
) {
	if (currentVendor) {
		const { custom_field_dropship_providers: globalSettingsFields } =
			globalSettingsStore;

		Object.values(STORE_SETTINGS_LABELS).forEach((label) => {
			if (!currentVendor.custom_field_dropship_providers) {
				currentVendor.custom_field_dropship_providers = [];
			}

			/** default to globalSettings value */
			const currentFieldValue =
				currentVendor.custom_field_dropship_providers.find(
					(field) => field.custom_field.label == label
				)?.value;
			if (!currentFieldValue) {
				const globalFieldValue = globalSettingsFields?.find(
					(field) => field.custom_field.label == label
				)?.value;
				if (globalFieldValue) {
					currentVendor.custom_field_dropship_providers.push({
						value: globalFieldValue,
						custom_field: {
							label,
						},
					});
				}
			}
		});
	}

	if (currentVendor) {
		const vendorDetails: VendorDetails = {
			id: currentVendor.id!,
			identifier: currentVendor.name,
			country_code: currentVendor.country?.toLowerCase() || "gr", // TODO country code
			time: {
				time_acceptance_hours:
					getFieldValue(currentVendor, "time_acceptance_hours") ||
					"10:00-16:00; Sa off",
				time_accept_order:
					Number(getFieldValue(currentVendor, "time_accept_order")) ||
					Number(getFieldValue(globalSettingsStore, "time_accept_order")) ||
					DEFAULT_TIMES.TO_ACCEPT,
				time_pick_order:
					Number(getFieldValue(currentVendor, "time_pick_order")) ||
					Number(getFieldValue(globalSettingsStore, "time_pick_order")) ||
					DEFAULT_TIMES.TO_PICK,
				time_days_to_cancel:
					Number(getFieldValue(currentVendor, "time_days_to_cancel")) ||
					DEFAULT_TIMES.DAYS_TO_CANCEL,
			},

			printer: {
				print_orientation:
					getFieldValue(currentVendor, "print_orientation") || "",
				printer_bluetooth_serial:
					getFieldValue(currentVendor, "printer_bluetooth_serial") || "",
				printer_model: getFieldValue(currentVendor, "printer_model") || "",
				tape_gap: getFieldValue(currentVendor, "tape_gap") || "",
				tape_length: getFieldValue(currentVendor, "tape_length") || "",
				tape_width: getFieldValue(currentVendor, "tape_width") || "",
			},

			address: {
				fullname: currentVendor.name,
				address: currentVendor.addressLineOne!,
				address2: currentVendor.addressLineTwo!,
				email: currentVendor.shippingEmail!,
				phonenumber: currentVendor.phone!,
				city: currentVendor.city,
				country: currentVendor.country,
				zipcode: currentVendor.zip,
			},
		};
		return vendorDetails;
	}
}

function getFieldValue(data: Onport_VendorDetails, fieldName: string) {
	return data.custom_field_dropship_providers?.find(
		(field) => field.custom_field.label == fieldName
	)?.value;
}
