import RootContext from "@client/context/RootContext";

declare module "express-serve-static-core" {
	interface Request {
		rootContext?: RootContext;
	}
}
