import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { ProductDTO } from "@feijuca/shared";
import { CLUB_DISCOUNT, CLUB_BASE_PRICE_CENTS, clubUnitPrice, formatBRL, STORE } from "@feijuca/shared";
import { api } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import { Icon } from "../../components/Icon";
import { ProductImage } from "../../components/ProductImage";
import { ErrorState, Loading } from "../../components/StateViews";
import { StoreHeader } from "./StoreHeader";
import { CategoryTabs } from "./CategoryTabs";
import { ProductRow } from "./ProductRow";
import { ProductSheet } from "./ProductSheet";
import { Logo } from "../../components/Logo";

export function LojaPage() {
  const store = useAsync(() => api.store());
  const catalog = useAsync(() => api.catalog());
  const [open, setOpen] = useState<ProductDTO | null>(null);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const categories = catalog.data ?? [];
  const featured = useMemo(() => categories.flatMap((c) => c.products).filter((p) => p.featured), [categories]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((c) => ({ ...c, products: c.products.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(q)) }))
      .filter((c) => c.products.length);
  }, [categories, query]);

  const focusSearch = () => {
    searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    searchRef.current?.focus();
  };

  return (
    <div className="loja">
      <StoreHeader store={store.data} onSearch={focusSearch} />

      <Link to="/clube" className="club-card">
        <div className="club-card__text">
          <span className="club-card__brand">Clube da Lu</span>
          <strong>Almoço e janta do mês com até {Math.round(CLUB_DISCOUNT.BOTH * 100)}% off</strong>
          <span>Pratos a partir de {formatBRL(clubUnitPrice(CLUB_BASE_PRICE_CENTS, "BOTH"))} e entrega grátis em horário fixo</span>
        </div>
        <span className="club-card__cta">Conhecer <Icon name="chevron" size={16} /></span>
      </Link>

      <div className="search">
        <Icon name="search" size={20} />
        <input ref={searchRef} id="busca" type="search" placeholder="Buscar no cardápio" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {catalog.loading && !catalog.data && <Loading label="Carregando o cardápio…" />}
      {catalog.error && <ErrorState message={catalog.error} onRetry={catalog.reload} />}

      {!query && featured.length > 0 && (
        <section className="featured" aria-labelledby="destaques">
          <h2 id="destaques" className="section-title">Destaques</h2>
          <div className="featured__rail">
            {featured.map((p) => (
              <button key={p.id} className="featured__card" onClick={() => setOpen(p)}>
                <ProductImage src={p.imageUrl} name={p.name} className="featured__img" />
                <span className="featured__name">{p.name}</span>
                <span className="price">{formatBRL(p.priceCents)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && !query && <CategoryTabs categories={categories} />}

      <div className="menu">
        {filtered.map((c) => (
          <section key={c.id} id={`cat-${c.slug}`} className="menu__section">
            <h2 className="section-title">{c.name}</h2>
            {c.products.map((p) => <ProductRow key={p.id} product={p} onOpen={setOpen} />)}
          </section>
        ))}
        {query && filtered.length === 0 && <p className="state">Nada encontrado para “{query}”.</p>}
      </div>

      <footer className="store-footer">
        <Logo size={44} />
        <p className="store-footer__slogan">{STORE.slogan}</p>
        <p>{STORE.address}</p>
        <p>
          <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={16} /> {STORE.whatsappDisplay}</a>
          {" · "}
          <a href={`https://instagram.com/${STORE.instagram}`} target="_blank" rel="noreferrer"><Icon name="instagram" size={16} /> @{STORE.instagram}</a>
        </p>
      </footer>

      <ProductSheet product={open} onClose={() => setOpen(null)} />
    </div>
  );
}
