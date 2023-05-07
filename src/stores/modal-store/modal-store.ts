import { makeAutoObservable } from "mobx";

import { ModalProps } from "@client/components";
import RootContext from "@client/context/RootContext";
import ErrorModals from "@client/helpers/error-modal";

export class ModalStore {
	modals: ModalProps[] = [];

	private errorModals?: ErrorModals;

	constructor(private rootContext: RootContext) {
		makeAutoObservable(this);

		this.initialise();
	}

	private initialise = async () => {
		if (process.env.REACT_APP_IS_CLIENT) {
			await import("@client/helpers/error-modal").then(
				(ErrorModals) =>
					(this.errorModals = new ErrorModals.default(this.rootContext))
			);
		}
	};

	findModal(modalId: string) {
		return this.modals.find((modal) => modal.id == modalId);
	}

	addModal(panel: ModalProps) {
		// const { lockBody } = useBodyScrollLocker();
		this.modals.push(panel);
		// lockBody(this.rootContext.layoutStore);
	}
	removeModal(panelID: ModalProps["id"]) {
		// const { unlockBody } = useBodyScrollLocker();
		const panel = this.modals.find((p) => p.id === panelID);

		panel && this.modals.splice(this.modals.indexOf(panel), 1);
		// unlockBody(this.rootContext.layoutStore);
	}
	showError(message: string, error: string) {
		this.errorModals && this.errorModals.showErrorModal(message, error);
	}
	showFullscreenError(error: string) {
		this.errorModals?.showFullscreenErrorModal(error);
	}

	// TODO: figure out why tsx in a class (server-side) does not work
	// const id = `error-${v4()}`;

	// this.addModal({
	// 	id,
	// 	showCloseBtn: true,
	// 	content: (
	// 		<GeneralMessage
	// 			buttonAction={() => this.removeModal(id)}
	// 			title={"Error"}
	// 			subtitle={message}
	// 			error={error}
	// 			imgSrc={"/images/general_error.png"}
	// 		/>
	// 	),
	// });
}
