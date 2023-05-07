import { LayoutStore } from "@client/stores/layout-store";

function lockBody(layoutStore: LayoutStore) {
	layoutStore.setBodyModifierTop(-window.pageYOffset);

	document.body.style.top = layoutStore.bodyModifierTop + "px";
	document.body.style.position = "fixed";
	document.body.style.overflow = "hidden";
	document.body.style.width = "100%";
}

function unlockBody(layoutStore: LayoutStore) {
	document.body.style.position = "";
	document.body.style.overflow = "";
	document.body.style.top = "";
	document.body.style.width = "";

	window.scrollTo({ top: -layoutStore.bodyModifierTop });
	layoutStore.setBodyModifierTop(0);
}

export default () => ({ lockBody, unlockBody });
