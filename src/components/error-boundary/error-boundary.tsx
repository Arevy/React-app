import "./error-boundary.scss";

import React, { Component, ReactNode } from "react";

import { inspectJSON } from "@client/helpers/utils";

import { GeneralMessage } from "../general-message";

type ErrorBoundaryProps = {
	children?: ReactNode;
};
type ErrorBoundaryState = {
	error: any;
};
export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { error: "" };
	}

	componentDidCatch(error: any, errorInfo: any) {
		this.setState({ error: { error, errorInfo } });
	}

	render() {
		if (this.state.error) {
			// You can render any custom fallback UI
			return <ErrorBoundaryComponent error={inspectJSON(this.state.error)} />;
		}

		return this.props.children;
	}
}

export function ErrorBoundaryComponent({ error }: { error: string }) {
	return (
		<div className="error-boundary">
			<GeneralMessage
				whiteOnBlack
				title={"OOPS! There was an error."}
				subtitle={
					"Please refresh the app. If the problem persists, contact support."
				}
				error={error}
				imgSrc={"/images/plane.gif"}
				buttonLabel="Refresh app"
				buttonAction={() => window.location.reload()}
			/>
		</div>
	);
}
