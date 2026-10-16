import type { ProductDTO } from "@feijuca/shared";
import { formatBRL } from "@feijuca/shared";
import { api } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../context/ToastContext";
import { ProductImage } from "../../components/ProductImage";
import { Loading } from "../../components/StateViews";
import { PageHead } from "./PageHead";

export function CardapioAdminPage() {
  const catalog = useAsync(() => api.admin.products());
  const toast = useToast();

  const update = async (p: ProductDTO, data: Partial<Pick<ProductDTO, "active" | "featured" | "priceCents">>, msg: string) => {
    try { await api.admin.updateProduct(p.id, data); toast(msg); catalog.reload(); }
    catch (e) { toast(e instanceof Error ? e.message : "Erro ao salvar"); }
  };

  const changePrice = (p: ProductDTO, value: string) => {
    const cents = Math.round(parseFloat(value.replace(",", ".")) * 100);
    if (!cents || cents === p.priceCents) return;
    update(p, { priceCents: cents }, `${p.name}: ${formatBRL(cents)}`);
  };

  return (
    <div className="g-page">
      <PageHead title="Cardápio" subtitle="Pause um prato que acabou ou ajuste o preço" />
      {catalog.loading && !catalog.data && <Loading />}
      {catalog.data?.map((c) => (
        <section key={c.id} className="g-card">
          <h2 className="g-card__title">{c.name}</h2>
          <ul className="menu-admin">
            {c.products.map((p) => (
              <li key={p.id} className={p.active ? "" : "is-off"}>
                <ProductImage src={p.imageUrl} name={p.name} className="menu-admin__img" />
                <span className="menu-admin__name"><b>{p.name}</b><small>{p.clubEligible ? "Entra no Clube" : ""}</small></span>
                <label className="menu-admin__price">
                  <span>R$</span>
                  <input key={p.priceCents} id={`preco-${p.id}`} defaultValue={(p.priceCents / 100).toFixed(2).replace(".", ",")} inputMode="decimal"
                    onBlur={(e) => changePrice(p, e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
                </label>
                <label className="switch">
                  <input type="checkbox" checked={p.active} onChange={() => update(p, { active: !p.active }, p.active ? `${p.name} pausado` : `${p.name} de volta ao cardápio`)} />
                  <span>{p.active ? "Vendendo" : "Pausado"}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
