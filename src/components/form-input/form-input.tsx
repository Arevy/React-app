import "./form-input.scss";

import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useEffect, useState } from "react";

import SvgIcon from "@client/components/reusable/SvgIcons";
import { ReactComponent as EyeHide } from "@client/components/reusable/SvgIcons/library/eye_hide.svg";
import { ReactComponent as EyeShow } from "@client/components/reusable/SvgIcons/library/eye_show.svg";

export enum INPUT_TYPES {
	text = "text",
	password = "password",
}

interface FormInputProps {
	type?: INPUT_TYPES;
	label?: string;
	labelClassName?: string;
	inputClassName?: string;
	eyeIconClassname?: string;
	defaultValue?: string;
	onInput?: (e: string) => void;
	onKeyDown?: (e: any) => void;
}

export const FormInput: FunctionComponent<FormInputProps> = observer(
	({
		type,
		label,
		labelClassName,
		inputClassName,
		eyeIconClassname,
		defaultValue,
		onInput,
		onKeyDown,
	}) => {
		const [isFocused, setIsFocused] = useState(false);
		const [showPassword, setShowPassword] = useState(false);
		const [inputValue, setInputValue] = useState(defaultValue || "");
		const [labelValue, setLabelValue] = useState(label);

		function toggleShowPassword() {
			setShowPassword(!showPassword);
		}

		function onChange(e: React.ChangeEvent<HTMLInputElement>) {
			const value = e.target.value;
			setInputValue(value);
			onInput && onInput(value);
		}

		useEffect(() => {
			if (isFocused || inputValue) {
				setLabelValue("");
			} else {
				setTimeout(() => {
					setLabelValue(label);
				}, 100);
			}
		}, [isFocused, label]);

		useEffect(() => {
			setLabelValue(label);
		}, [label]);

		return (
			<div className="input-wrapper">
				{label && (
					<label
						className={classNames(
							"label",
							{
								["up"]: isFocused,
							},
							labelClassName
						)}
					>
						{label}
					</label>
				)}
				<input
					value={inputValue}
					type={
						type === INPUT_TYPES.password
							? showPassword
								? INPUT_TYPES.text
								: INPUT_TYPES.password
							: type
					}
					onFocus={() => {
						setIsFocused(true);
					}}
					onBlur={() => {
						setIsFocused(false);
					}}
					onChange={onChange}
					onKeyDown={onKeyDown}
					className={classNames("input", inputClassName)}
					placeholder={labelValue}
				/>
				{type === INPUT_TYPES.password && (
					<div
						className={classNames(
							"eye-icon",
							{ ["hide"]: !isFocused && !inputValue },
							eyeIconClassname
						)}
						onClick={toggleShowPassword}
					>
						{showPassword ? (
							<SvgIcon component={EyeShow} />
						) : (
							<SvgIcon component={EyeHide} />
						)}
					</div>
				)}
			</div>
		);
	}
);
