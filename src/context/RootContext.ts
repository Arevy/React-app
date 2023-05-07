import { createContext, useContext } from "react";

import { APIService, CookieService } from "@client/services";
import { Logger } from "@client/services/Logger";
import {
	AuthStore,
	LayoutStore,
	ModalStore,
	VendorStore,
} from "@client/stores";

export class RootContext {
	apiService: APIService;
	cookieService: CookieService;
	logger: Logger;

	layoutStore: LayoutStore;
	vendorStore: VendorStore;
	authStore: AuthStore;

	modalStore: ModalStore;

	constructor() {
		this.apiService = new APIService();
		this.cookieService = new CookieService(this);
		this.logger = new Logger(this);

		this.modalStore = new ModalStore(this);
		this.layoutStore = new LayoutStore(this);

		this.vendorStore = new VendorStore(this);
		this.authStore = new AuthStore(this);
	}
}

export const rootContext = new RootContext();
const context = createContext(rootContext);

export const useRootContext = () => useContext(context);

export default RootContext;
