import { Order } from "@client/stores";

export function getTotalNumberOfProducts(order: Order) {
	return order.products.reduce(
		(sum, product) => sum + product.order_details.quantity,
		0
	);
}
