import dayjs from "dayjs";
import { useRef, useState } from "react";
import { useEffectOnce } from "react-use";

import { useRootContext } from "@client/context/RootContext";
import { Order, OrderStatuses } from "@client/stores";

type useCircleCountdownProps = {
	order: Order;
};

export default (order: Order) => {
	const rootContext = useRootContext();

	const [isMounted, setIsMounted] = useState(false);
	useEffectOnce(() => {
		setIsMounted(true);
		return () => setIsMounted(false);
	});

	const times = {
		accept: (order.dates.received?.timebomb_when_received_at || 0) * 60,
		pick: (order.dates.changes.accepted?.timebomb_when_accepted_at || 0) * 60,
	};
	const isNew = useRef(order.status === OrderStatuses.Pending);

	const canMoveNextUntil = useRef(
		isNew.current
			? order.dates.received?.can_accept_until
			: order.dates.changes.accepted?.can_pick_until
	);

	const remainingTime = dayjs(canMoveNextUntil.current).diff(
		dayjs(),
		"seconds"
	);

	const countdownDuration = isNew.current ? times.accept : times.pick;

	// begining with 66% of time change color
	const firstInterval = Math.floor(countdownDuration * 0.66);
	// begining with 33% of time change color
	const secondInterval = Math.floor(countdownDuration * 0.33);
	const colors = {
		green: "#40BE37",
		orange: "#FFA149",
		red: "#FF496A",
		gray: "#D8D2D2",
		black: "#000000",
	};

	return {
		countdownDuration,
		firstInterval,
		secondInterval,
		colors,
		isMounted,
		isNew,
		remainingTime,
	};
};
