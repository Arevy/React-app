import "./order-card-header.scss";

import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { CircleCountdown } from "@client/components/reusable/circle-countdown";
import { getTotalNumberOfProducts } from "@client/components/reusable/hooks/useGetTotalNumberOfProducts";
import { Order, OrderStatuses } from "@client/stores";

interface OrderCardHeaderProps {
	order: Order;
	closeOrderCardModal?: () => any;
}

export const OrderCardHeader: FunctionComponent<OrderCardHeaderProps> =
	observer(({ order, closeOrderCardModal }) => {
		function getTotalItemsText(items: number) {
			if (items > 1) {
				return "items";
			} else {
				return "item";
			}
		}

		const totalItems = getTotalNumberOfProducts(order);

		return (
			<div className="card-header">
				<div className="card-header-left">
					<div className="order-id">#{order.id}</div>
					<div className="user-name">
						{`${
							order.shipping_details.user_details.firstName
						} ${order.shipping_details.user_details.lastName?.charAt(0)}.`}
					</div>
				</div>
				<div className="card-header-right">
					<div className="total-items">
						{totalItems} {getTotalItemsText(totalItems)}
					</div>

					{(order.status === OrderStatuses.Pending ||
						order.status === OrderStatuses.Picking) && (
						<CircleCountdown
							key={order.id}
							order={order}
							closeOrderCardModal={closeOrderCardModal}
						/>
					)}
				</div>
			</div>
		);
	});
