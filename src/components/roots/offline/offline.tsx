import "./offline.scss";

import { observer } from "mobx-react";
import ReactDOM from "react-dom";

import { GeneralMessage } from "@client/components/general-message";
import useIsOnline from "@client/hooks/useIsOnline";

export const Offline: React.FC = observer(() => {
	const isOnline = useIsOnline();

	return ReactDOM.createPortal(
		<div
			className="offline-wrapper"
			style={{
				visibility: !isOnline ? "visible" : "hidden",
			}}
		>
			<GeneralMessage
				whiteOnBlack
				title={"No internet connection"}
				subtitle={"Check your network connection and try again"}
				imgSrc={"/images/offline_white.png"}
			/>
		</div>,
		document.getElementById("offline")!
	);
});
Offline.displayName = "OfflinePortal";
