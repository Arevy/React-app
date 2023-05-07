import "./general-message.scss";

import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { ReactComponent as CloseIcon } from "@client/components/reusable/SvgIcons/library/close_icon.svg";

import SvgIcon from "../reusable/SvgIcons";

interface GeneralMessageProps {
	title?: string;
	subtitle?: string;
	error?: string;
	imgSrc?: string;

	whiteOnBlack?: boolean;

	buttonLabel?: string;
	buttonAction?: () => void;
}

export const GeneralMessage: FunctionComponent<GeneralMessageProps> = observer(
	({
		title,
		subtitle,
		error,
		imgSrc,
		whiteOnBlack,
		buttonLabel = "Ok",
		buttonAction,
	}) => {
		return (
			<div
				className={classNames("general-message-wrapper", {
					"wrapper-black": whiteOnBlack,
				})}
			>
				<div
					className={classNames("general-message-container", {
						"container-black": whiteOnBlack,
					})}
				>
					{imgSrc && <img className="general-message-img" src={imgSrc} />}

					{title && (
						<div className={classNames("general-message-title", "modal")}>
							{title}
						</div>
					)}
					{subtitle && (
						<div className="general-message-subtitle">{subtitle}</div>
					)}
					{error && <div className="general-message-error">{error}</div>}

					{buttonLabel && buttonAction && (
						<button
							className={
								whiteOnBlack ? "general-message-black" : "general-message-btn"
							}
							onClick={buttonAction}
						>
							{buttonLabel}
						</button>
					)}
				</div>
			</div>
		);
	}
);
