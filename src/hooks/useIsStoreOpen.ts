import opening_hours from "opening_hours";

export default (country_code: string, open_hours_string = "") =>
	getOpenHours(country_code, open_hours_string).getState();

export function getOpenHours(country_code: string, open_hours_string = "") {
	if (!open_hours_string) {
		// console.error(
		// 	`no value supplied for open_hours_string: ${open_hours_string}`
		// );
		return { getState: () => false };
		// throw `no value supplied for open_hours_string: ${open_hours_string}`;
	}

	if (country_code == "il") {
		open_hours_string = open_hours_string
			.replaceAll("PH,", "")
			.replace("PH", "");
	}

	const open_hours = new opening_hours(
		open_hours_string,
		// @ts-ignore
		country_code ? { address: { country_code } } : undefined
	);
	// TODO - country code - fix Public Holidays for Israel - submit
	/**
	 * need to submit
	 * https://nominatim.openstreetmap.org/reverse?format=json&lat=32.51696&lon=35.12786&zoom=18&addressdetails=1
	 * to
	 *https://github.com/opening-hours/opening_hours.js/tree/87fbadf04967bd3e1790da4d4fc5692fe596e72d/src/holidays
	 */
	// https://projets.pavie.info/yohours/?oh=08:00-23:00;%20Fr%2010:00-20:00;%20PH,Sa%20off

	return open_hours;
}
