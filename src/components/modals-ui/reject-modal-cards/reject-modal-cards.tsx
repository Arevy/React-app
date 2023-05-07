import "./reject-modal-cards.scss";

import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, MouseEvent } from "react";

import { OrderCardDetails } from "@client/components/order-tabs/order-card/order-card-details";
import SvgIcon from "@client/components/reusable/SvgIcons";
import { ReactComponent as CustomerService } from "@client/components/reusable/SvgIcons/library/customer_service.svg";
import { useRootContext } from "@client/context/RootContext";
import { Order } from "@client/stores";

import { ModalCardHeader } from "../modal-card-header";

interface RejectModalCardsProps {
	rejectOrder: (orderID: number) => void;
	closeModal: (e: MouseEvent) => any;
	closeOrderCardModal: () => any;
	order: Order;
}

export const RejectModalCards: FunctionComponent<RejectModalCardsProps> =
	observer(({ rejectOrder, closeModal, closeOrderCardModal, order }) => {
		const { modalStore } = useRootContext();

		function closeAndReject(e: MouseEvent) {
			closeOrderCardModal();
			closeModal(e);
			const cancelledorder_id = "cancelledorder-modal" + order.id;
			modalStore.addModal({
				id: cancelledorder_id,
				showCloseBtn: true,
				content: (
					<div className="cancelled-order-modal">
						<ModalCardHeader order={order} isCancelledOrder />
						<OrderCardDetails
							order={order}
							isCancelledOrder
							toggleShowCancelledOrderModal={(e) => {
								e.preventDefault();
								e.stopPropagation();
								rejectOrder(order.id);

								modalStore.removeModal(cancelledorder_id);
							}}
						/>
					</div>
				),
			});
		}

		return (
			<div className="reject-modal-wrapper">
				<div className="overlay-title">
					Are you sure you want to reject the order?
				</div>
				<div className="buttons-wrapper">
					<button
						className={classNames("card-btn", "yes")}
						onClick={closeAndReject}
					>
						Yes
					</button>
					<button
						className={classNames("card-btn", "cancel")}
						onClick={closeModal}
					>
						Cancel
					</button>
				</div>
				<div className="horizontal-line" />
				<div className="reject-subtitle">
					If there’s a minor issue with the order, <br /> please call the
					customer service and work it out.
				</div>
				<div className="customer-service">
					<SvgIcon component={CustomerService} />
					<div className="right-section">
						<div className="customer-service-title">Customer service</div>
						<div className="phone-number">03-7130000</div>
					</div>
				</div>
			</div>
		);
	});
