import "./header.scss";

import { observer } from "mobx-react-lite";

import SvgIcon from "@client/components/reusable/SvgIcons";
import { ReactComponent as GreenCircle } from "@client/components/reusable/SvgIcons/library/green_circle.svg";
import { ReactComponent as MenuIcon } from "@client/components/reusable/SvgIcons/library/menu_icon.svg";
import { ReactComponent as RedCircle } from "@client/components/reusable/SvgIcons/library/red_circle.svg";
import { COOKIES } from "@client/context/config";
import { useRootContext } from "@client/context/RootContext";
import useIsStoreOpen from "@client/hooks/useIsStoreOpen";

import useClickCount from "../reusable/hooks/useClickCount";

export const Header = observer(() => {
	const {
		authStore,
		vendorStore: { vendorDetails },
		cookieService,
	} = useRootContext();

	const isStoredOpen = useIsStoreOpen(
		vendorDetails?.country_code || "gr",
		vendorDetails?.time.time_acceptance_hours
	);

	/** if onport dev env, click 4 times to log out */
	const incrementCount = useClickCount(
		Number(cookieService.get(COOKIES.vendorCompanyID)) === 4256
			? authStore.logout
			: () => undefined
	);

	return (
		<div className="header-container">
			<div className="menu-selector">
				<SvgIcon component={MenuIcon} />
				<div className="menu-title">Active orders</div>
			</div>
			<img className="terminalx-img" src="/images/terminalx_img.png" />
			<div className="store-btn" onClick={incrementCount}>
				{isStoredOpen ? (
					<SvgIcon component={GreenCircle} className="circle-icon" />
				) : (
					<SvgIcon component={RedCircle} className="circle-icon" />
				)}
				<div className="store-btn-text">{`Store ${
					isStoredOpen ? "open" : "closed"
				}`}</div>
			</div>
		</div>
	);
});
