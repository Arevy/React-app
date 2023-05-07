import "./time-is-up-modal.scss";

import { observer } from "mobx-react-lite";
import { FunctionComponent, MouseEvent } from "react";

import SvgIcon from "@client/components/reusable/SvgIcons";
import { ReactComponent as TimeIsUp } from "@client/components/reusable/SvgIcons/library/time_is_up.svg";

interface TimeIsUpModalProps {
	orderId: number;
	onClick_okBtn?: (e: MouseEvent) => any;
}

export const TimeIsUpModal: FunctionComponent<TimeIsUpModalProps> = observer(
	({ orderId, onClick_okBtn }) => {
		return (
			<div className="time-is-up-modal-content">
				<SvgIcon className="time-is-up-img" component={TimeIsUp} />
				<div className="time-is-up-title">Unfortunately the time is up</div>
				<div className="time-is-up-subtitle">
					We have to cancel the order{" "}
					<span className="order-id">#{orderId}</span>
				</div>
				<button className="time-is-up-ok-btn" onClick={onClick_okBtn}>
					Ok
				</button>
			</div>
		);
	}
);
