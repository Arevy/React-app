// import { v4 } from "uuid";

import { v4 } from "uuid";

import { GeneralMessage } from "@client/components";
import { ErrorBoundaryComponent } from "@client/components/error-boundary/error-boundary";
import RootContext from "@client/context/RootContext";

export default class ErrorModals {
	constructor(private rootContext: RootContext) {}

	showErrorModal = (message: string, error: string) => {
		const id = `error-${v4()}`;

		this.rootContext.modalStore.addModal({
			id,
			content: (
				<GeneralMessage
					buttonAction={() => this.rootContext.modalStore.removeModal(id)}
					title={"Error"}
					subtitle={message}
					error={error}
					imgSrc={"/images/general_error.png"}
				/>
			),
		});
	};

	showFullscreenErrorModal = (error: string) => {
		this.rootContext.modalStore.addModal({
			id: "big-error",
			content: <ErrorBoundaryComponent error={error} />,
		});
	};
}
