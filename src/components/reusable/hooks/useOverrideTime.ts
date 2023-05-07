import { OVERRIDES } from "@client/context/config";

export default (type: "accept" | "picking") => {
	if (window) {
		const url = new URL(window.location.href);
		const time_token = url.searchParams.get(OVERRIDES.time_token);

		if (time_token == process.env.REACT_APP_OVERRIDE_TOKEN) {
			let time = 0;
			switch (type) {
				case "accept":
					time = Number(url.searchParams.get(OVERRIDES.time_accept));
					console.log("--- OVERRIDING accept time:", time);
					return time;
				case "picking":
					time = Number(url.searchParams.get(OVERRIDES.time_pick));
					console.log("--- OVERRIDING picking time:", time);
					return time;
			}
		}
	}

	return 0;
};
