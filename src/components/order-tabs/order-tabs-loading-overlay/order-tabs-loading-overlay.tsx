import "./order-tabs-loading-overlay.scss";

export const OrderTabsLoadingOverlay = () => {
	return (
		<div className="orders-loading">
			<div className="orders-loading-label">
				<img src="/images/no_orders.png" />
				loading orders
			</div>
		</div>
	);
};
