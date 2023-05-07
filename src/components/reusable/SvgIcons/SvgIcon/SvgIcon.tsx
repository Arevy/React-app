import "./SvgIcon.scss";

import classnames from "classnames";
import * as React from "react";

export interface ISvgIconProps {
	component: React.FunctionComponent<any>;
	size?: string;
	className?: string;
	color?: string;
	viewBox?: string;
	children?: string;
	width?: string;
	height?: string;
	onClick?: (e: React.MouseEvent) => any;
}

const SvgIcon: React.FC<ISvgIconProps> = React.memo((props) => {
	const { className, component: Component, children, ...restProps } = props;

	return (
		<Component
			{...restProps}
			className={classnames("style-defaults", className)}
		>
			{children}
		</Component>
	);
});

SvgIcon.displayName = "SvgIcon";

export default SvgIcon;
