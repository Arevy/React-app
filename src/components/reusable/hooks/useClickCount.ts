import { useRef } from "react";

export default (callback: () => any, clicksToTrigger = 4) => {
	const clickCount = useRef(0);
	const clickCountTimeout = useRef<ReturnType<typeof setTimeout>>();

	function incrementCount() {
		clearTimeout(clickCountTimeout.current);
		clickCount.current++;

		if (clickCount.current >= clicksToTrigger) {
			callback();
		}

		clickCountTimeout.current = setTimeout(() => {
			clickCount.current = 0;
		}, 500);
	}

	return incrementCount;
};
