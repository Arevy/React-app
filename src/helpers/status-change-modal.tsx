import { GeneralMessage, LoadingDots } from "@client/components";
import RootContext from "@client/context/RootContext";

const modalID = "status-change-modal";
const modalErrorID = "status-change-error-modal";

export default class StatusChangeModal {
	timeout?: ReturnType<typeof setTimeout>;

	constructor(private rootContext: RootContext) {}

	resetTimeout = (overrideSeconds?: number) => {
		clearTimeout(this.timeout);

		this.timeout = setTimeout(
			this.printingTimedOut,
			(overrideSeconds || Number(process.env.REACT_APP_TIMEOUT_ORDER_STATUS)) *
				1000
		);
	};

	openModal = (overrideSeconds?: number) => {
		this.resetTimeout(overrideSeconds);

		if (!this.rootContext.modalStore.findModal(modalID)) {
			this.rootContext.modalStore.addModal({
				id: modalID,
				content: (
					<LoadingDots
						text="please wait while printing is done..."
						image="/images/printer.png"
						invertImageColor
					/>
				),
			});
		}
	};

	printingTimedOut = () => {
		this.doneChangingStatus(
			"Please try again.",
			"changing status time exceeded - timeout"
		);
	};

	doneChangingStatus = (errorMessage?: string, error?: string) => {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}

		if (this.rootContext.modalStore.findModal(modalID)) {
			this.rootContext.modalStore.removeModal(modalID);
		}

		if (errorMessage) {
			this.rootContext.modalStore.addModal({
				id: modalErrorID,
				showCloseBtn: true,
				content: (
					<GeneralMessage
						buttonAction={() =>
							this.rootContext.modalStore.removeModal(modalErrorID)
						}
						title={"Could not change order status"}
						subtitle={errorMessage}
						error={error}
						imgSrc={"/images/general_error.png"}
					/>
				),
			});
		}
	};
}
