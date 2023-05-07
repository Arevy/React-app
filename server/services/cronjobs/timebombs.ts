import { AxiosRequestConfig } from "axios";

import { VendorDetails } from "@client/stores";
import { getVendorActiveOrders, getVendorDetails } from "@server/data";

const headers: AxiosRequestConfig["headers"] = {
	Authorization: `Bearer ${process.env.ONPORT_MASTER_TOKEN}`, // admin
	"Content-Type": "application/json",
};

export async function timebombs() {
	// get all vendors
	const vendors = await getAllVendors();
	// get and process vendor's orders

	for (let i = 0; i < vendors.length; i++) {
		const currentVendor = vendors[i];
		await (currentVendor.id && processOrders(currentVendor));
	}
}

async function getAllVendors() {
	return (await getVendorDetails(
		{ returnAllVendors: true },
		headers
	)) as VendorDetails[];
}

async function processOrders(vendorDetails: VendorDetails) {
	// console.log(vendorDetails);
	return getVendorActiveOrders({ vendorDetails }, headers);
}
