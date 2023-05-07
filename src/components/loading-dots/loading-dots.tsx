import "./loading-dots.scss";

import { motion } from "framer-motion";

type LoadingDotsProps = {
	text?: string;
	image?: string;
	invertImageColor?: boolean;
};

export const LoadingDots: React.FC<LoadingDotsProps> = ({
	text,
	image,
	invertImageColor,
}) => {
	const ContainerVariants = {
		initial: {
			transition: {
				staggerChildren: 0.3,
			},
		},
		animate: {
			transition: {
				staggerChildren: 0.3,
			},
		},
	};

	const DotVariants = {
		initial: {
			opacity: 1,
		},
		animate: {
			opacity: 0,
		},
	};

	const DotTransition = {
		duration: 1.5,
		ease: "easeInOut",
		repeat: Infinity,
	};

	return (
		<div className="loading-wrapper">
			{image && (
				<img
					className={`dots-img${!invertImageColor ? "" : " dots-img-invert"}`}
					src={image}
				/>
			)}

			{text && <div className="dots-text">{text}</div>}

			<motion.div
				className="loading-container"
				variants={ContainerVariants}
				initial="initial"
				animate="animate"
			>
				<motion.span
					className="loading-dot"
					variants={DotVariants}
					transition={DotTransition}
				/>
				<motion.span
					className="loading-dot"
					variants={DotVariants}
					transition={DotTransition}
				/>
				<motion.span
					className="loading-dot"
					variants={DotVariants}
					transition={DotTransition}
				/>
			</motion.div>
		</div>
	);
};
