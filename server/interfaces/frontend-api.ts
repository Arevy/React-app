import { FrontendEndpoints } from "@server/routers/frontend.router";

export type FrontendEndpointsKeys = keyof typeof FrontendEndpoints;
export type FrontendEndpointsTypes = {
	[T in FrontendEndpointsKeys]: (typeof FrontendEndpoints)[T];
};
