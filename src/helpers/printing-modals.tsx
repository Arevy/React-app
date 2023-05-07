import { GeneralMessage, LoadingDots } from "@client/components";
import RootContext from "@client/context/RootContext";

const printModalID = "print-modal";
const printingDoneModalID = "printing-done-modal";

export default class PrintingModals {
	timeout?: ReturnType<typeof setTimeout>;

	constructor(private rootContext: RootContext) {
		this.rootContext = rootContext;

		window && (window.donePrinting = this.donePrinting);
	}

	resetTimeout = (overrideSeconds?: number) => {
		clearTimeout(this.timeout);

		this.timeout = setTimeout(
			this.printingTimedOut,
			(overrideSeconds || Number(process.env.REACT_APP_TIMEOUT_PRINT)) * 1000
		);
	};

	openPrintingModal = (overrideSeconds?: number) => {
		this.resetTimeout(overrideSeconds);

		if (!this.rootContext.modalStore.findModal(printModalID)) {
			this.rootContext.modalStore.addModal({
				id: printModalID,
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
		this.donePrinting(
			"Could not print",
			"Please try printing again.",
			"printing time exceeded - timeout"
		);
	};

	donePrinting = (title?: string, message?: string, error?: string) => {
		this.rootContext.logger.trace("donePrinting", { title, message, error });

		if (this.timeout) {
			clearTimeout(this.timeout);
		}

		if (this.rootContext.modalStore.findModal(printModalID)) {
			this.rootContext.modalStore.removeModal(printModalID);
		}

		const closeModal = () => {
			this.rootContext.modalStore.removeModal(printingDoneModalID);
		};

		if (title) {
			this.rootContext.modalStore.addModal({
				id: printingDoneModalID,
				showCloseBtn: true,
				content: (
					<GeneralMessage
						buttonAction={closeModal}
						title={title}
						subtitle={message}
						error={error}
						imgSrc={"/images/printer-unavailable.png"}
					/>
				),
			});
		}
	};
}
