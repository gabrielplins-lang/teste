import type { StoreDTO } from "@feijuca/shared";
import { formatBRL } from "@feijuca/shared";
import { Logo } from "../../components/Logo";
import { Icon } from "../../components/Icon";

/** Capa da loja com logo sobreposta e as informações de entrega, como nos apps de delivery. */
export function StoreHeader({ store, onSearch }: { store: StoreDTO | null; onSearch: () => void }) {
  const fees = store?.zones.map((z) => z.feeCents) ?? [];
  const etas = store?.zones ?? [];
  const minFee = fees.length ? Math.min(...fees) : null;
  const etaMin = etas.length ? Math.min(...etas.map((z) => z.etaMin)) : null;
  const etaMax = etas.length ? Math.max(...etas.map((z) => z.etaMax)) : null;

  return (
    <header className="store-header">
      <div className="store-cover">
        <div className="store-cover__art" aria-hidden="true">
          <span className="store-cover__kicker">Temos</span>
          <span className="store-cover__big">Feijoada</span>
          <span className="store-cover__kicker">e muito mais!</span>
        </div>
        <button className="store-cover__btn" onClick={onSearch} aria-label="Buscar no cardápio">
          <Icon name="search" size={20} />
        </button>
      </div>

      <div className="store-id">
        <Logo size={84} className="store-id__logo" />
        <div className="store-id__text">
          <h1>Feijuca da Lu</h1>
          <p>Brasileira · Feijoada · Comida caseira</p>
        </div>
      </div>

      <div className="store-meta">
        <div className="store-meta__item">
          <Icon name="bike" size={18} />
          <span>
            {etaMin !== null ? `${etaMin}–${etaMax} min` : "Entrega"}
            {minFee !== null && <> · a partir de <b>{formatBRL(minFee)}</b></>}
          </span>
        </div>
        <div className="store-meta__item">
          <Icon name="clock" size={18} />
          <span>{store?.openingHours ?? "Abre todos os dias"}</span>
        </div>
        {store && (
          <div className="store-meta__item">
            <Icon name="bag" size={18} />
            <span>Pedido mínimo {formatBRL(store.minimumOrderCents)}</span>
          </div>
        )}
      </div>
    </header>
  );
}
