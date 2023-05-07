import { useEffectOnce, useTimeoutFn } from "react-use";

import { useRootContext } from "@client/context/RootContext";

export default () => {
	const { authStore, logger } = useRootContext();
	const [, cancel, reset] = useTimeoutFn(onLongPress, 2000);

	useEffectOnce(cancel);

	function onLongPress() {
		logger.debug(
			"useSkipLogin",
			`logging in through bypass... token ${process.env.REACT_APP_VENDOR_TOKEN}`
		);
		document.cookie = `vendor-token=${process.env.REACT_APP_VENDOR_TOKEN}`;
		authStore.authenticate();
	}

	function onPress() {
		reset();
	}
	function onRelease() {
		cancel();
	}

	return {
		onMouseDown: onPress,
		onMouseUp: onRelease,
		onTouchStart: onPress,
		onTouchEnd: onRelease,
	};
};
