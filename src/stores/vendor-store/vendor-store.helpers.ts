import dayjs from "dayjs";

import { DEFAULT_TIMES } from "@client/context/config";

import {
	OrderStatuses,
	Order_MinimalDetails,
	VendorDetails,
} from "./vendor-store-types";

// TODO - move this logic to the backend
export function computeDates(
	order: Order_MinimalDetails,
	vendorDetails: VendorDetails,
	rejection_reason?: string
) {
	const currentChangeTime = dayjs().toISOString();
	const timebomb_when_accepted_at =
		vendorDetails?.time.time_pick_order || DEFAULT_TIMES.TO_PICK;

	switch (order.status) {
		case OrderStatuses.Picking:
			order.dates.changes.accepted = {
				accepted_at: currentChangeTime,
				can_pick_until: dayjs()
					.add(timebomb_when_accepted_at, "minutes")
					.toISOString(),
				timebomb_when_accepted_at,
			};
			break;

		case OrderStatuses.Packed:
			order.dates.changes.picking_done_at = currentChangeTime;
			break;

		case OrderStatuses.Shipped:
			order.dates.changes.shipped_at = currentChangeTime;
			break;

		case OrderStatuses.Delivered:
			order.dates.changes.received_by_customer_at = currentChangeTime;
			break;

		case OrderStatuses.Timedout:
			order.dates.changes.timedout_at = currentChangeTime;
			break;

		case OrderStatuses.Rejected:
			order.dates.changes.rejected_at = currentChangeTime;
			order.dates.rejection_reason = rejection_reason;
			break;
	}

	return order.dates;
}
