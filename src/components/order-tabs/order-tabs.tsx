import "./order-tabs.scss";

import classNames from "classnames";
import { observer } from "mobx-react-lite";

import OrderCard from "@client/components/order-tabs/order-card/OrderCard";
import { ReactComponent as CustomBorder } from "@client/components/reusable/SvgIcons/library/custom_border.svg";
import { useRootContext } from "@client/context/RootContext";
import { OrderStatuses } from "@client/stores";

import SvgIcon from "../reusable/SvgIcons";
import { OrderTabsLoadingOverlay } from "./order-tabs-loading-overlay";

export const OrderTabs = observer(() => {
	const {
		vendorStore: { activeOrders, setOrderStatus, pullingDataInProgress },
		layoutStore,
	} = useRootContext();

	function acceptOrder(orderID: number) {
		setOrderStatus(orderID, OrderStatuses.Picking);
	}
	function readyForDelivery(orderID: number) {
		setOrderStatus(orderID, OrderStatuses.Packed);
	}
	function collectedOrder(orderID: number) {
		layoutStore.setHasCollectedOrder(orderID);

		setTimeout(() => {
			setOrderStatus(orderID, OrderStatuses.Shipped);
		}, 1300);
	}
	function rejectOrder(orderID: number) {
		setOrderStatus(orderID, OrderStatuses.Rejected);
	}

	const newOrders = activeOrders
		.filter((order) => order.status === OrderStatuses.Pending)
		.sort(
			(a, b) =>
				new Date(a.dates.received?.received_at || 0).getTime() -
				new Date(b.dates.received?.received_at || 0).getTime()
		);

	const pickingOrders = activeOrders
		.filter((order) => order.status === OrderStatuses.Picking)
		.sort(
			(a, b) =>
				new Date(a.dates.changes.accepted?.can_pick_until || 0).getTime() -
				new Date(b.dates.changes.accepted?.can_pick_until || 0).getTime()
		);
	const packedOrders = activeOrders
		.filter((order) => order.status === OrderStatuses.Packed)
		.sort(
			(a, b) =>
				new Date(a.dates.changes?.picking_done_at || 0).getTime() -
				new Date(b.dates.changes?.picking_done_at || 0).getTime()
		);

	return (
		<>
			<div className="tabs-wrapper">
				<div className={classNames("tab-container", "new")}>
					<div className="tab-selector">
						<span
							className={classNames("tab-name", {
								fading: pullingDataInProgress,
							})}
						>
							Waiting for acceptance
						</span>
						{newOrders.length > 0 && (
							<span className="orders-number">{newOrders.length}</span>
						)}
					</div>
					<div className="orders-list">
						{pullingDataInProgress && <OrderTabsLoadingOverlay />}

						{!newOrders.length &&
						!pickingOrders.length &&
						!packedOrders.length ? (
							<div className="no-orders-container">
								<SvgIcon component={CustomBorder} />
								<div className="no-orders-content">
									<img className="no-orders-img" src={"/images/plane.gif"} />
									<div className="no-orders-text">
										Stay in touch, we will give you an order <br /> as soon as
										it appears
									</div>
								</div>
							</div>
						) : (
							newOrders.length > 0 && (
								<OrderCard
									key={newOrders[0].id}
									order={newOrders[0]}
									acceptOrder={acceptOrder}
									rejectOrder={rejectOrder}
									isFirstOrder={true}
									newOrdersLength={newOrders.length}
									pickingOrdersLength={pickingOrders.length}
								/>
							)
						)}
					</div>
				</div>

				<div className={classNames("tab-container", "picking")}>
					<div className="tab-selector">
						<span className="tab-name">Picking</span>
						{pickingOrders.length > 0 && (
							<span className="orders-number">{pickingOrders.length}</span>
						)}
					</div>
					<div className="orders-list">
						{pickingOrders.map((order) => (
							<OrderCard
								key={order.id}
								order={order}
								readyForDelivery={readyForDelivery}
								rejectOrder={rejectOrder}
								isPickingTab
								isFirstOrder={order.id === pickingOrders[0].id}
								newOrdersLength={newOrders.length}
								pickingOrdersLength={pickingOrders.length}
							/>
						))}
					</div>
				</div>
				<div className={classNames("tab-container", "ready")}>
					<div className="tab-selector">
						<span className="tab-name">Ready</span>
						{packedOrders.length > 0 && (
							<span className="orders-number">{packedOrders.length}</span>
						)}
					</div>
					<div className="orders-list">
						{packedOrders.map((order) => (
							<OrderCard
								key={order.id}
								order={order}
								collectedOrder={collectedOrder}
								isReadyTab
								isFirstOrder={order.id === packedOrders[0].id}
								pickingOrdersLength={pickingOrders.length}
							/>
						))}
					</div>
				</div>
			</div>
		</>
	);
});
