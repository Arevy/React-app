import "./modal.scss";

import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, MouseEvent } from "react";

import SvgIcon from "@client/components/reusable/SvgIcons";
import { ReactComponent as CloseIcon } from "@client/components/reusable/SvgIcons/library/close_icon.svg";
import { useRootContext } from "@client/context/RootContext";

export interface ModalProps {
	id: string;
	showCloseBtn?: boolean;
	content: any;
	onClosed?: (e: MouseEvent) => any;
	closeOnBackdropClick?: boolean;
}

export const Modal: FunctionComponent<ModalProps> = observer(
	({ id, showCloseBtn, content, onClosed, closeOnBackdropClick = true }) => {
		const { modalStore } = useRootContext();

		function handleModalClosing(e: MouseEvent) {
			e.preventDefault();
			e.stopPropagation();

			onClosed && onClosed(e);

			modalStore.removeModal(id);
		}

		return (
			<div className={classNames("modal-container")} id={id}>
				<div onClick={handleModalClosing} className={classNames("overlay")} />

				{showCloseBtn && <CloseButton onClick={handleModalClosing} />}

				<div className="modal-content">{content}</div>
			</div>
		);
	}
);

function CloseButton({ onClick }: { onClick: (e: MouseEvent) => void }) {
	return (
		<div className="overlay-close-btn" onClick={onClick}>
			Close{" "}
			<SvgIcon
				component={CloseIcon}
				className="overlay-close-icon"
				width="20"
				height="20"
			/>
		</div>
	);
}
