import { useState } from "react";

/** Foto do prato com um substituto elegante quando a imagem não existe. */
export function ProductImage({ src, name, className }: { src: string | null; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`product-img product-img--empty ${className ?? ""}`} aria-hidden="true">
        <span>{name.charAt(0)}</span>
      </div>
    );
  }
  return <img className={`product-img ${className ?? ""}`} src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}
