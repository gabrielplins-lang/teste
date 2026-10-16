import { useState } from "react";
import { addDays, canChangeDay, todayInBrazil } from "@feijuca/shared";
import { api } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import { Loading } from "../../components/StateViews";
import { PageHead } from "./PageHead";

function Bars({ rows, tone }: { rows: { name: string; quantity: number }[]; tone: "club" | "orders" }) {
  const max = Math.max(1, ...rows.map((r) => r.quantity));
  if (!rows.length) return <p className="muted">Nada por enquanto.</p>;
  return (
    <div className="bars">
      {rows.map((r) => (
        <div className="bars__row" key={r.name}>
          <span>{r.name}</span>
          <b>{r.quantity}</b>
          <div className="bars__track"><div className={`bars__fill bars__fill--${tone}`} style={{ width: `${(r.quantity / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export function CozinhaPage() {
  const [date, setDate] = useState(addDays(todayInBrazil(), 1));
  const report = useAsync(() => api.admin.kitchen(date), [date], 60000);
  const r = report.data;
  const clubTotal = r?.club.reduce((s, x) => s + x.quantity, 0) ?? 0;
  const ordersTotal = r?.orders.reduce((s, x) => s + x.quantity, 0) ?? 0;
  const closed = !canChangeDay(date);

  return (
    <div className="g-page">
      <PageHead title="Cozinha" subtitle="Quantas marmitas de cada prato preparar" date={date} onDate={setDate} />
      {report.loading && !r && <Loading />}
      {r && (
        <div className="g-grid">
          <section className="g-card">
            <div className="g-card__head">
              <h2>Clube da Lu</h2>
              <span className={`tag ${closed ? "tag--ok" : "tag--warn"}`}>{closed ? "Fechado" : "Assinantes ainda podem trocar até 20h"}</span>
            </div>
            <p className="g-big">{clubTotal}<small> marmitas</small></p>
            <Bars rows={r.club} tone="club" />
          </section>
          <section className="g-card">
            <div className="g-card__head"><h2>Pedidos avulsos</h2><span className="tag">App, WhatsApp e iFood</span></div>
            <p className="g-big">{ordersTotal}<small> itens</small></p>
            <Bars rows={r.orders} tone="orders" />
          </section>
        </div>
      )}
    </div>
  );
}
