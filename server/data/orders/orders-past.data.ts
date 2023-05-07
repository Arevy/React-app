import { Order } from "@client/stores";

// TODO - getVendorPastOrders
export async function getVendorPastOrders() {
	return require("../test-data/db/orders.json") as Order[];
}
