import { Courier } from "@client/stores";
import { FrontendEndpoint } from "@server/routers";

// TODO - import couriers
export const getCouriers: FrontendEndpoint<{}> = (req) => {
	return require("@server/data/test-data/db/couriers.json") as Courier[];
};
