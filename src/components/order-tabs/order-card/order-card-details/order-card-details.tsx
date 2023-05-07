import "./order-card-details.scss";

import classNames from "classnames";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { FunctionComponent, MouseEvent, RefObject, useRef } from "react";

import { getTotalNumberOfProducts } from "@client/components/reusable/hooks/useGetTotalNumberOfProducts";
import { useRootContext } from "@client/context/RootContext";
import { Order } from "@client/stores";

import { ProductDetails } from "./product-details";

interface OrderCardDetailsProps {
	order: Order;
	animationParams?: any;
	orderCardRef?: RefObject<HTMLDivElement>;
	acceptOrder?: (orderID: number) => void;
	readyForDelivery?: (orderID: number) => void;
	toggleShowModal?: (e: MouseEvent) => any;
	collectedOrder?: (orderID: number) => void;
	toggleShowCancelledOrderModal?: (e: MouseEvent) => void;
	closeOrderCardModal?: () => any;
	isPickingTab?: boolean;
	isReadyToPickModal?: boolean;
	isCancelledOrder?: boolean;
}

export const OrderCardDetails: FunctionComponent<OrderCardDetailsProps> =
	observer(
		({
			order,
			animationParams,
			orderCardRef,
			acceptOrder,
			readyForDelivery,
			toggleShowModal,
			collectedOrder,
			toggleShowCancelledOrderModal,
			closeOrderCardModal,
			isPickingTab,
			isReadyToPickModal,
			isCancelledOrder,
		}) => {
			const { modalStore, vendorStore } = useRootContext();

			const totalProducts = getTotalNumberOfProducts(order);

			const orderContainerExpandedRef = useRef<HTMLDivElement>(null);

			function handleCollectedBtn(e: MouseEvent) {
				e.preventDefault();
				e.stopPropagation();

				collectedOrder?.(order.id);
				modalStore.removeModal("order-ready-modal-" + order.id);
			}

			function handlePrintBtn(e: MouseEvent) {
				e.preventDefault();
				e.stopPropagation();

				vendorStore.printShippingLabel(order.onportReference);
			}

			return (
				<motion.div
					className={classNames("products-details-wrapper")}
					ref={orderContainerExpandedRef}
				>
					<div className="border-line" />
					<div
						className="product-container"
						style={{ overflowY: totalProducts > 2 ? "auto" : "hidden" }}
					>
						{order.products.length > 0 &&
							order.products.map((product) => {
								const quantity = product.order_details.quantity;
								if (quantity > 1) {
									const quantityArr = [...Array(quantity).keys()];
									return (
										<div key={"products-wrapper-" + product.sku}>
											{quantityArr.map((item) => {
												return (
													<ProductDetails
														key={`${product.sku}-${item}`}
														product={product}
													/>
												);
											})}
										</div>
									);
								} else
									return <ProductDetails key={product.sku} product={product} />;
							})}
					</div>
					<div className="border-line" />
					<div className="buttons-section">
						{isReadyToPickModal ? (
							<>
								<button className="print-btn" onClick={handlePrintBtn}>
									Print again
								</button>
								<button
									className="collected-by-courier-btn"
									onClick={handleCollectedBtn}
								>
									Collected by courier
								</button>
							</>
						) : isCancelledOrder ? (
							<button
								className="close-btn"
								onClick={toggleShowCancelledOrderModal}
							>
								Close
							</button>
						) : (
							<>
								<button
									className="accept-btn"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										closeOrderCardModal && closeOrderCardModal();
										if (animationParams) {
											animationParams.width =
												orderCardRef?.current?.getBoundingClientRect().width ||
												0;
											animationParams.height =
												orderCardRef?.current?.getBoundingClientRect().height ||
												0;
											animationParams.y =
												orderCardRef?.current?.getBoundingClientRect().y || 0;
											// animationParams.x = _animationParams.x;
										}

										isPickingTab
											? readyForDelivery?.(order.id)
											: acceptOrder?.(order.id);
									}}
								>
									{isPickingTab ? "Ready to delivery" : "Accept order"}
								</button>
								<button className="reject-btn" onClick={toggleShowModal}>
									Reject
								</button>
							</>
						)}
					</div>
				</motion.div>
			);
		}
	);
