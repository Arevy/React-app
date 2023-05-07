import "./OrderCard.scss";

import classNames from "classnames";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { FunctionComponent, MouseEvent, useRef } from "react";

import { RejectModalCards } from "@client/components/modals-ui/reject-modal-cards";
import SvgIcon from "@client/components/reusable/SvgIcons";
import { ReactComponent as CheckIconWhite } from "@client/components/reusable/SvgIcons/library/check_icon_white.svg";
import { useRootContext } from "@client/context/RootContext";
import { Order, OrderStatuses } from "@client/stores";

import { OrderCardDetails } from "./order-card-details";
import { OrderCardHeader } from "./order-card-header";
import { OrderCardReady } from "./order-card-ready";

interface IOrderCardProps {
	order: Order;
	acceptOrder?: (orderID: number) => void;
	rejectOrder?: (orderID: number) => void;
	readyForDelivery?: (orderID: number) => void;
	collectedOrder?: (orderID: number) => void;
	isPickingTab?: boolean;
	isReadyTab?: boolean;
	isFirstOrder?: boolean;
	newOrdersLength?: number;
	pickingOrdersLength?: number;
}

const OrderCard: FunctionComponent<IOrderCardProps> = ({
	order,
	acceptOrder,
	rejectOrder,
	readyForDelivery,
	collectedOrder,
	isPickingTab,
	isReadyTab,
	isFirstOrder,
	newOrdersLength,
	pickingOrdersLength,
}) => {
	const {
		modalStore,
		layoutStore: {
			animationParams,
			hasCollectedOrder,
			orderId,
			toggleCollectedOrder,
		},
	} = useRootContext();

	const orderCardRef = useRef<HTMLDivElement>(null);

	function openOrderCardModal(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();

		modalStore.addModal({
			id: "order-card-modal",
			showCloseBtn: true,
			content: (
				<div className="order-card-modal-container">
					<OrderCardHeader
						order={order}
						closeOrderCardModal={closeOrderCardModal}
					/>
					<OrderCardDetails
						order={order}
						animationParams={animationParams}
						orderCardRef={orderCardRef}
						acceptOrder={acceptOrder}
						readyForDelivery={readyForDelivery}
						toggleShowModal={show_cancelModal}
						collectedOrder={collectedOrder}
						closeOrderCardModal={closeOrderCardModal}
						isPickingTab={isPickingTab}
					/>
				</div>
			),
		});
	}

	const _animationParams = {
		x: orderCardRef.current?.getBoundingClientRect().x || 0,
		width: orderCardRef.current?.getBoundingClientRect().width || 0,
		height: orderCardRef.current?.getBoundingClientRect().height || 0,
		duration: 0.5,
		ease: "linear",
	};

	function show_cancelModal(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();

		modalStore.addModal({
			id: "cancel-modal",
			content: (
				<RejectModalCards
					rejectOrder={rejectOrder!}
					order={order}
					closeModal={hide_cancelModal}
					closeOrderCardModal={closeOrderCardModal}
				/>
			),
		});
	}

	function hide_cancelModal(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();

		modalStore.removeModal("cancel-modal");
	}

	function closeOrderCardModal() {
		modalStore.removeModal("order-card-modal");
	}

	return (
		<motion.div
			ref={orderCardRef}
			className={classNames("order-wrapper", { ["ready"]: isReadyTab })}
			initial={{
				x: order.status === OrderStatuses.Pending ? 0 : animationParams.x,
				y:
					(isFirstOrder && !newOrdersLength && isPickingTab) ||
					(isFirstOrder && !pickingOrdersLength)
						? 0
						: animationParams.y,
				opacity: 1,
			}}
			animate={{
				x: 0,
				y: orderId === order.id && isReadyTab && hasCollectedOrder ? 300 : 0,
				opacity:
					orderId === order.id && isReadyTab && hasCollectedOrder ? 0 : 1,
			}}
			transition={{
				ease: _animationParams.ease,
				duration: _animationParams.duration,
			}}
		>
			<motion.div
				className="order-background"
				initial={{
					width:
						order.status === OrderStatuses.Pending
							? "100%"
							: animationParams.width,
					height:
						order.status === OrderStatuses.Pending
							? "100%"
							: animationParams.height,
				}}
				animate={{ width: "100%", height: "100%" }}
				transition={{
					ease: _animationParams.ease,
					duration: _animationParams.duration,
				}}
			/>
			<motion.div
				className="order-background-green"
				initial={{
					height: 0,
				}}
				animate={{
					height:
						orderId === order.id &&
						isReadyTab &&
						(toggleCollectedOrder || hasCollectedOrder)
							? "100%"
							: 0,
				}}
				transition={{
					ease: _animationParams.ease,
					duration: _animationParams.duration,
				}}
			>
				{toggleCollectedOrder && isReadyTab && (
					<SvgIcon component={CheckIconWhite} className="check-icon-white" />
				)}
			</motion.div>
			{isReadyTab ? (
				<OrderCardReady order={order} collectedOrder={collectedOrder} />
			) : (
				<div className="order-container" onClick={openOrderCardModal}>
					<OrderCardHeader order={order} />
				</div>
			)}
		</motion.div>
	);
};

export default observer(OrderCard);
