import { useState } from "react";
import { useEffectOnce } from "react-use";

export default () => {
	const [isOnline, setIsOnline] = useState(true);

	function setWindowOnline() {
		const windowOnline = window.navigator.onLine;
		if (windowOnline == undefined) {
			return false;
		}

		setIsOnline(windowOnline);
		return true;
	}
	function online() {
		if (!setWindowOnline()) {
			// if, for some reason, window.navigator.onLine is undefined, set to true because of this event (window > online)
			setIsOnline(true);
		}
	}
	function offline() {
		if (setWindowOnline() == false) {
			// if, for some reason, window.navigator.onLine is undefined, set to false because of this event (window > offline)
			setIsOnline(false);
		}
	}

	useEffectOnce(() => {
		window.addEventListener("offline", offline);
		window.addEventListener("online", online);

		return () => {
			window.removeEventListener("offline", offline);
			window.removeEventListener("online", online);
		};
	});

	return isOnline;
};
