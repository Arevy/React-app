import "./login-page.scss";

import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useState } from "react";

import { FormInput, INPUT_TYPES } from "@client/components";
import { useRootContext } from "@client/context/RootContext";
import useSkipLogin from "@client/hooks/useSkipLogin";

export const LoginPage = observer(() => {
	const { authStore } = useRootContext();

	const [email, setEmail] = useState(process.env.REACT_APP_VENDOR_USER || "");
	const [password, setPassword] = useState(
		process.env.REACT_APP_VENDOR_PASS || ""
	);
	const [usernameOrPassAreNotProvided, setUsernameOrPassAreNotProvided] =
		useState(false);

	const skipLogin = useSkipLogin();

	function loginHandler() {
		if (!email || !password) {
			setUsernameOrPassAreNotProvided(true);
			return;
		}
		authStore.login(email, password);
	}

	function checkIfEnterIsPressed(e: any) {
		if (e.key === "Enter") {
			loginHandler();
		}
	}

	return (
		<div className="login-container">
			<div className="left-side">
				<div className="login-header">
					<img src="/images/login-logo.png" />
				</div>
				<div className="login-wrapper">
					<FormInput
						label={
							usernameOrPassAreNotProvided && !email
								? "Enter username please"
								: "Username"
						}
						onInput={(value: string) => setEmail(value)}
						defaultValue={email}
						inputClassName={classNames("user-input", {
							["error"]: usernameOrPassAreNotProvided && !email,
						})}
					/>
					<FormInput
						label={
							usernameOrPassAreNotProvided && !password
								? "Enter password please"
								: "Password"
						}
						onInput={(value: string) => setPassword(value)}
						onKeyDown={checkIfEnterIsPressed}
						type={INPUT_TYPES.password}
						defaultValue={password}
						inputClassName={classNames("password-input", {
							["error"]: usernameOrPassAreNotProvided && !password,
						})}
					/>
					<button onClick={loginHandler} {...skipLogin} className="sign-in-btn">
						Sign in
					</button>
				</div>
			</div>
			<div className="right-side">
				<img className="substrate-img" src="/images/login_substrate.png" />
				<img className="login-img" src="/images/login_img.png" />
			</div>
		</div>
	);
});
