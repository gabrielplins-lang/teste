import type { ProductDTO } from "@feijuca/shared";
import { clubUnitPrice, formatBRL } from "@feijuca/shared";
import { ProductImage } from "../../components/ProductImage";

export function discountPercent(p: ProductDTO): number | null {
  return p.compareAtCents && p.compareAtCents > p.priceCents
    ? Math.round((1 - p.priceCents / p.compareAtCents) * 100)
    : null;
}

/** Linha do cardápio: texto à esquerda, foto à direita (padrão dos apps de delivery). */
export function ProductRow({ product, onOpen }: { product: ProductDTO; onOpen: (p: ProductDTO) => void }) {
  const off = discountPercent(product);
  return (
    <button className="product-row" onClick={() => onOpen(product)}>
      <div className="product-row__text">
        <h3>{product.name}</h3>
        <p className="product-row__desc">{product.description}</p>
        <div className="product-row__price">
          {off ? (
            <>
              <span className="price price--deal">{formatBRL(product.priceCents)}</span>
              <s>{formatBRL(product.compareAtCents!)}</s>
              <span className="badge badge--deal">-{off}%</span>
            </>
          ) : (
            <span className="price">{formatBRL(product.priceCents)}</span>
          )}
          {product.serves > 1 && <span className="badge">Serve {product.serves}</span>}
          {product.preorder && <span className="badge">Encomenda</span>}
        </div>
        {product.clubEligible && (
          <span className="club-hint">No Clube a partir de {formatBRL(clubUnitPrice(product.priceCents, "BOTH"))}</span>
        )}
      </div>
      <ProductImage src={product.imageUrl} name={product.name} className="product-row__img" />
    </button>
  );
}
