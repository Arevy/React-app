import { Onport_VendorLoginResponse } from "@server/interfaces";

import { makeOnportCall } from "./utils-data";

type VendorLoginParams = {
	email: string;
	password: string;
};
export async function vendorLogin({ email, password }: VendorLoginParams) {
	const data = await makeOnportCall<Onport_VendorLoginResponse>({
		method: "post",
		url: "https://api.jetti.io/auth/login",
		data: {
			email,
			password,
			role: "dropship_provider",
		},
	});

	const { token, dropshipProviderId, companyId } = data;

	return { dropshipProviderId, token, companyId };
}
