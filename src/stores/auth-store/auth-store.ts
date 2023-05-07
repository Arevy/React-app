import { action, makeAutoObservable, runInAction } from "mobx";

import { COOKIES } from "@client/context/config";
import RootContext from "@client/context/RootContext";

export class AuthStore {
	checkedIfLoggedIn = false;
	isLoggingIn = false;
	loggedIn = false;
	vendorID?: number;
	constructor(private rootContext: RootContext) {
		makeAutoObservable(this);

		if (process.env.REACT_APP_IS_CLIENT) {
			this.checkIfLoggedIn();
		}
	}

	checkIfLoggedIn = async () => {
		if (this.rootContext.cookieService.get(COOKIES.vendor_token)) {
			await this.authenticate();
		}

		runInAction(() => {
			this.checkedIfLoggedIn = true;
		});
	};

	authenticate = async () => {
		try {
			await this.rootContext.vendorStore.initialise();

			runInAction(() => {
				this.loggedIn = true;
			});
		} catch (err) {
			console.error("AuthStore :: failed to authenticate", err);
		}
	};

	login = async (email: string, password: string) => {
		this.isLoggingIn = true;
		try {
			await this.rootContext.apiService.api("/vendor/login", {
				email,
				password,
			});

			await this.authenticate();

			runInAction(() => {
				this.isLoggingIn = false;
			});
		} catch (err) {
			runInAction(() => {
				this.isLoggingIn = false;
			});
			this.rootContext.logger.error("login error:", err);
		}
	};

	logout = async () => {
		if (window) {
			this.rootContext.cookieService.remove(COOKIES.vendorCompanyID);
			this.rootContext.cookieService.remove(COOKIES.vendorID);
			this.rootContext.cookieService.remove(COOKIES.vendor_token);

			runInAction(() => {
				this.loggedIn = false;
			});
		}
	};
}
