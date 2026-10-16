import { useEffect, useState } from "react";
import type { ProductDTO } from "@feijuca/shared";
import { formatBRL } from "@feijuca/shared";
import { Sheet } from "../../components/Sheet";
import { Stepper } from "../../components/Stepper";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { discountPercent } from "./ProductRow";

/** Detalhe do prato: foto, descrição, observação e quantidade. */
export function ProductSheet({ product, onClose }: { product: ProductDTO | null; onClose: () => void }) {
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const { add } = useCart();
  const toast = useToast();

  useEffect(() => { setQty(1); setNotes(""); }, [product?.id]);
  if (!product) return null;
  const off = discountPercent(product);

  const confirm = () => {
    add(product, qty, notes);
    toast(`${qty}× ${product.name} na sacola`);
    onClose();
  };

  return (
    <Sheet open onClose={onClose} className="product-sheet"
      footer={
        <div className="product-sheet__footer">
          <Stepper value={qty} onChange={setQty} min={1} />
          <button className="btn btn--primary btn--grow" onClick={confirm}>
            <span>Adicionar</span><span>{formatBRL(product.priceCents * qty)}</span>
          </button>
        </div>
      }>
      <div className="product-sheet__hero">
        {product.imageUrl && <div className="product-sheet__blur" style={{ backgroundImage: `url(${product.imageUrl})` }} aria-hidden="true" />}
        {product.imageUrl
          ? <img src={product.imageUrl} alt="" className="product-sheet__img" />
          : <div className="product-sheet__img product-img--empty"><span>{product.name.charAt(0)}</span></div>}
      </div>
      <div className="product-sheet__info">
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <div className="product-row__price">
          <span className={`price ${off ? "price--deal" : ""}`}>{formatBRL(product.priceCents)}</span>
          {off && <><s>{formatBRL(product.compareAtCents!)}</s><span className="badge badge--deal">-{off}%</span></>}
          {product.serves > 1 && <span className="badge">Serve {product.serves}</span>}
        </div>
        {product.preorder && <p className="note">Este item é feito por encomenda. Combine o dia da entrega na observação.</p>}
      </div>
      <div className="product-sheet__notes">
        <div className="row-between">
          <label htmlFor="obs" className="section-label">Alguma observação?</label>
          <span className="muted small">{notes.length}/140</span>
        </div>
        <textarea id="obs" className="input textarea" maxLength={140} rows={3} value={notes}
          onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: sem couve, farofa à parte" />
      </div>
    </Sheet>
  );
}
