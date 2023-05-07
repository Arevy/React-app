import "./dashboard-page.scss";

import { observer } from "mobx-react-lite";
import { useEvent } from "react-use";

import { OrderTabs } from "@client/components";
import { useRootContext } from "@client/context/RootContext";

export const DashboardPage = observer(() => {
	const { vendorStore } = useRootContext();
	function onWindowFocus() {
		vendorStore.getVendorAndActiveOrders();
	}
	useEvent("focus", onWindowFocus);

	return <OrderTabs />;
});
