import "./modal-card-header.scss";

import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { getTotalNumberOfProducts } from "@client/components/reusable/hooks/useGetTotalNumberOfProducts";
import SvgIcon from "@client/components/reusable/SvgIcons";
import { ReactComponent as AttentionIcon } from "@client/components/reusable/SvgIcons/library/attention_icon.svg";
import { ReactComponent as CheckIcon } from "@client/components/reusable/SvgIcons/library/check_icon.svg";
import { Order } from "@client/stores";

interface ModalCardHeaderProps {
	order: Order;
	isReadyToPickModal?: boolean;
	isCancelledOrder?: boolean;
	isModal?: boolean;
}

export const ModalCardHeader: FunctionComponent<ModalCardHeaderProps> =
	observer(({ order, isReadyToPickModal, isCancelledOrder }) => {
		function getTotalItemsText(items: number) {
			if (items > 1) {
				return "items";
			} else {
				return "item";
			}
		}

		const totalItems = getTotalNumberOfProducts(order);

		return (
			<div className="modal-header">
				<div className="modal-header-left">
					<div className="order-id">#{order.id}</div>
					<div className="user-name">
						{`${
							order.shipping_details.user_details.firstName
						} ${order.shipping_details.user_details.lastName?.charAt(0)}.`}
					</div>
				</div>
				<div className="modal-header-right">
					<div className="total-items">
						{totalItems} {getTotalItemsText(totalItems)}
					</div>

					{isReadyToPickModal && (
						<div className="ready-to-pick">
							<SvgIcon component={CheckIcon} className="check-icon" />
							Ready to Delivery
						</div>
					)}

					{isCancelledOrder && (
						<div className="cancelled-order">
							<SvgIcon component={AttentionIcon} className="attention-icon" />
							Order cancelled
						</div>
					)}
				</div>
			</div>
		);
	});
