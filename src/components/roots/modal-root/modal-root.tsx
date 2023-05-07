import { observer } from "mobx-react-lite";
import ReactDOM from "react-dom";

import { Modal } from "@client/components/reusable/modal";
import { useRootContext } from "@client/context/RootContext";

export const ModalPortal = observer(() => {
	const { modalStore } = useRootContext();

	return ReactDOM.createPortal(
		<>
			{modalStore.modals.map((modal) => (
				<Modal key={modal.id} {...modal} />
			))}
		</>,
		document.getElementById("modals")!
	);
});
