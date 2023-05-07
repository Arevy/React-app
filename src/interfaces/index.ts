declare global {
	interface Window {
		webkit: {
			messageHandlers: { printMessageHandler: { postMessage: Function } };
		};
		donePrinting: (title?: string, message?: string, error?: string) => void;
	}
}
export * from "./Date";
