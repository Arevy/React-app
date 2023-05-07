import "./product-details.scss";

import JsBarcode from "jsbarcode";
import { observer } from "mobx-react-lite";
import { FunctionComponent, MouseEvent, useEffect, useRef } from "react";

import { useRootContext } from "@client/context/RootContext";
import { Product } from "@client/stores";

interface ProductDetailsProps {
	product: Product;
}

export const ProductDetails: FunctionComponent<ProductDetailsProps> = observer(
	({ product }) => {
		const { modalStore } = useRootContext();

		const imgRef = useRef<HTMLImageElement>(null);

		useEffect(() => {
			JsBarcode(`#${product.sku}`, product.order_details.barcode || "", {
				fontSize: 30,
				textMargin: -4,
			});
		}, [imgRef.current, modalStore.modals.length]);

		function show_barcodeModal(e: MouseEvent) {
			e.preventDefault();
			e.stopPropagation();

			modalStore.addModal({
				id: "barcode-modal-" + product.sku,
				showCloseBtn: true,
				content: (
					<div className="barcode-modal-wrapper">
						<img id={product.sku} className="barcode-img" />
					</div>
				),
			});
		}
		function show_imageGalleryModal(e: MouseEvent) {
			e.preventDefault();
			e.stopPropagation();

			modalStore.addModal({
				id: "gallery-modal-" + product.sku,
				showCloseBtn: true,
				content: <img className="large-img" src={product.tx_details.image} />,
			});
		}

		return (
			<div key={product.sku} className="product-details">
				<img
					className="product-image"
					src={product.tx_details?.image}
					onClick={show_imageGalleryModal}
				/>
				<div className="product-attributes">
					<div className="product-attribute-title">
						{product.tx_details?.name}
					</div>
					<div className="first-row">
						<div className="product-attribute">
							Size: <span className="bold">{product.order_details?.size}</span>
						</div>
						<div className="product-attribute">
							Color:{" "}
							<span className="bold">{product.order_details?.color}</span>
						</div>
					</div>
					<div className="product-attribute">
						SKU: <span className="bold">{product.sku}</span>
					</div>
					<div className="barcode-img-container">
						<img
							id={product.sku}
							ref={imgRef}
							className="barcode-img"
							onClick={show_barcodeModal}
						/>
					</div>
				</div>
			</div>
		);
	}
);
