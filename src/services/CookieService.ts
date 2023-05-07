import RootContext from "@client/context/RootContext";

export class CookieService {
	constructor(private rootContext: RootContext) {}

	// TODO - handle server-side cookie management

	set(name: string, value: string, days = 10000) {
		if (process.env.REACT_APP_IS_CLIENT) {
			const date: Date = new Date();

			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

			document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
		}
	}
	get(name: string) {
		if (process.env.REACT_APP_IS_CLIENT) {
			const nameEQ = name + "=";
			const ca = document.cookie.split(";");

			for (let i = 0; i < ca.length; i++) {
				let c = ca[i];
				while (c.charAt(0) == " ") c = c.substring(1, c.length);
				if (c.indexOf(nameEQ) == 0) {
					return c.substring(nameEQ.length, c.length);
				}
			}
		}

		return null;
	}

	remove(name: string) {
		document.cookie = name + "=; Max-Age=-99999999;";
	}
}
