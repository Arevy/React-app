import "./circle-countdown.scss";

import { observer } from "mobx-react-lite";
import { useRef } from "react";
import {
	ColorFormat,
	CountdownCircleTimer,
	MultipleColors,
} from "react-countdown-circle-timer";

import { useRootContext } from "@client/context/RootContext";
import useCircleCountdown from "@client/hooks/useCircleCountdown";
import { Order, OrderStatuses } from "@client/stores";

import { CircleCountdownModals } from "./circle-countdown-modals";

interface CircleCountdownProps {
	order: Order;
	closeOrderCardModal?: () => any;
}

export const CircleCountdown = observer(
	({ order, closeOrderCardModal }: CircleCountdownProps) => {
		const rootContext = useRootContext();
		const {
			countdownDuration,
			firstInterval,
			secondInterval,
			colors,
			isMounted,
			remainingTime,
			isNew,
		} = useCircleCountdown(order);

		const circleCountdownModal = useRef(
			CircleCountdownModals(order, rootContext)
		);
		const cancelModalOpen = useRef(false);

		/* Timer computaion region */

		return (
			<CountdownCircleTimer
				isPlaying
				duration={countdownDuration}
				initialRemainingTime={remainingTime}
				size={56}
				strokeWidth={3}
				isSmoothColorTransition={false}
				colors={
					[
						colors.green,
						colors.orange,
						colors.red,
						colors.red,
					] as MultipleColors["colors"]
				}
				colorsTime={[countdownDuration, firstInterval, secondInterval, 0]}
				trailColor={colors.gray as ColorFormat}
				trailStrokeWidth={1}
				onComplete={(totalElapsedTime) => {
					if (!cancelModalOpen.current) {
						rootContext.logger.trace("cancelling order", {
							totalElapsedTime,
							isNew,
							isMounted,
							order,
						});

						cancelModalOpen.current = true;
						closeOrderCardModal && closeOrderCardModal();
						circleCountdownModal.current.show_timeUpModal();
					}
					return { shouldRepeat: false };
				}}
			>
				{({ remainingTime }) => {
					const minutes = Math.floor(remainingTime / 60);
					const seconds = remainingTime % 60;

					return (
						<div className="timer" style={{ textAlign: "center" }}>
							<div
								className="value"
								style={{
									fontSize: "20px",
									fontWeight: 500,
									color: remainingTime < 120 ? colors.red : colors.black,
								}}
							>
								{minutes}
							</div>
							<div
								className="text"
								style={{
									fontSize: "10px",
									color: remainingTime < 120 ? colors.red : colors.black,
									marginTop: "-2px",
									paddingBottom: "3px",
								}}
							>
								{seconds}
							</div>
						</div>
					);
				}}
			</CountdownCircleTimer>
		);
	}
);
