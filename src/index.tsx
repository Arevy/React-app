import "./styles/global.scss";

import { Provider } from "mobx-react";
import { createRoot } from "react-dom/client";

import { App } from "./components";
import { rootContext } from "./context/RootContext";
import reportWebVitals from "./reportWebVitals";

// @ts-ignore
window.rootContext = rootContext;

const rootNode = document.getElementById("root");
const reactRoot = createRoot(rootNode!);
reactRoot.render(
	<Provider rootContext={rootContext}>
		<App />
	</Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
