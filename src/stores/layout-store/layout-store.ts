import { makeAutoObservable } from "mobx";

import RootContext from "@client/context/RootContext";

export class LayoutStore {
	animationParams = {
		x: -500,
		y: 0,
		width: 0,
		height: 0,
	};

	hasCollectedOrder = false;
	toggleCollectedOrder = false;
	orderId = -1;
	bodyModifierTop = 0;

	constructor(private rootContext: RootContext) {
		makeAutoObservable(this);
	}

	public setHasCollectedOrder = (orderId: number) => {
		this.toggleCollectedOrder = true;
		this.orderId = orderId;

		setTimeout(() => {
			this.toggleCollectedOrder = false;
		}, 1000);
		setTimeout(() => {
			this.hasCollectedOrder = true;
		}, 1001);
		setTimeout(() => {
			this.hasCollectedOrder = false;
		}, 1300);
	};

	public setBodyModifierTop = (newTop: number) =>
		(this.bodyModifierTop = newTop);
}
