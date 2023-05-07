import "./app.scss";

import { observer } from "mobx-react-lite";
import { BrowserRouter } from "react-router-dom";

import { Header, LoadingDots, ModalPortal, Offline } from "@client/components";
import { useRootContext } from "@client/context/RootContext";
import { LoginPage } from "@client/pages/login-page";
import { Router } from "@client/router";

import { ErrorBoundary } from "../error-boundary/error-boundary";

export const App = observer(() => {
	const {
		authStore: { checkedIfLoggedIn, loggedIn, isLoggingIn },
	} = useRootContext();

	return (
		<ErrorBoundary>
			<Offline />

			<ModalPortal />

			{!checkedIfLoggedIn || isLoggingIn ? (
				<LoadingDots />
			) : !loggedIn ? (
				<LoginPage />
			) : (
				<BrowserRouter>
					<Header />
					<Router />
				</BrowserRouter>
			)}
		</ErrorBoundary>
	);
});
