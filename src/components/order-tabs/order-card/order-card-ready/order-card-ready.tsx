import "./order-card-ready.scss";

import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, MouseEvent } from "react";

import { ModalCardHeader } from "@client/components/modals-ui/modal-card-header";
import SvgIcon from "@client/components/reusable/SvgIcons";
import { ReactComponent as CarIcon } from "@client/components/reusable/SvgIcons/library/car_icon.svg";
import { useRootContext } from "@client/context/RootContext";
import { Order } from "@client/stores";

import { OrderCardDetails } from "../order-card-details";

interface OrderCardReadyProps {
	order: Order;
	collectedOrder?: (orderID: number) => void;
}

export const OrderCardReady: FunctionComponent<OrderCardReadyProps> = observer(
	({ order, collectedOrder }) => {
		const { modalStore } = useRootContext();

		function openReadyModal(e: MouseEvent) {
			e.preventDefault();
			e.stopPropagation();

			modalStore.addModal({
				id: "order-ready-modal-" + order.id,
				showCloseBtn: true,
				content: (
					<div className="ready-to-pick-modal-container">
						<ModalCardHeader order={order} isReadyToPickModal={true} />
						<OrderCardDetails
							order={order}
							isReadyToPickModal={true}
							collectedOrder={collectedOrder}
						/>
					</div>
				),
			});
		}

		return (
			<div className={classNames("order-container", "ready-tab")}>
				<div className="centered-title">{`Order ID: ${order.id}`}</div>
				<div className="centered-subtitle">
					{`${
						order.shipping_details.user_details.firstName
					} ${order.shipping_details.user_details.lastName?.charAt(0)}.`}
				</div>
				<div className="click-area" onClick={openReadyModal}>
					<SvgIcon component={CarIcon} />
					<div className="view-order">
						<div className="view-order-text">View order</div>
					</div>
				</div>
				<button
					className="collected-btn"
					onClick={() => collectedOrder?.(order.id)}
				>
					Collected by courier
				</button>
			</div>
		);
	}
);
