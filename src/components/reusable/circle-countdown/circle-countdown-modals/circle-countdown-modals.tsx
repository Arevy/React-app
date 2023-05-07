import "./circle-countdown-modals.scss";

import { MouseEvent } from "react";

import { ModalCardHeader } from "@client/components/modals-ui/modal-card-header";
import { TimeIsUpModal } from "@client/components/modals-ui/time-is-up-modal";
import { OrderCardDetails } from "@client/components/order-tabs/order-card/order-card-details";
import RootContext from "@client/context/RootContext";
import { Order, OrderStatuses } from "@client/stores";

export const CircleCountdownModals = (
	order: Order,
	rootContext: RootContext
) => {
	const { modalStore, vendorStore } = rootContext;

	const timeup_id = "timeup-modal-" + order.id;
	const cancelledorder_id = "cancelledorder-modal" + order.id;

	function show_cancelledOrderModal(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();

		modalStore.removeModal(timeup_id);

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

							modalStore.removeModal(cancelledorder_id);
						}}
					/>
				</div>
			),
		});
	}
	function show_timeUpModal() {
		vendorStore.setOrderStatus(order.id, OrderStatuses.Timedout);

		modalStore.addModal({
			id: timeup_id,
			showCloseBtn: true,
			onClosed: show_cancelledOrderModal,
			content: (
				<TimeIsUpModal
					orderId={order.id}
					onClick_okBtn={show_cancelledOrderModal}
				/>
			),
		});
	}

	return { show_timeUpModal };
};
