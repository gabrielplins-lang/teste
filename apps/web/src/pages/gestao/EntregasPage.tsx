import { useState } from "react";
import { CLUB_WINDOWS, ORDER_STATUS_LABEL, todayInBrazil } from "@feijuca/shared";
import { api } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import { Icon } from "../../components/Icon";
import { Loading } from "../../components/StateViews";
import { PageHead } from "./PageHead";

export function EntregasPage() {
  const [date, setDate] = useState(todayInBrazil());
  const report = useAsync(() => api.admin.deliveries(date), [date], 30000);
  const r = report.data;
  const lunch = r?.club.reduce((s, x) => s + x.lunch, 0) ?? 0;
  const dinner = r?.club.reduce((s, x) => s + x.dinner, 0) ?? 0;

  return (
    <div className="g-page">
      <PageHead title="Entregas" subtitle="Rotas do motoboy por bairro" date={date} onDate={setDate} />
      {report.loading && !r && <Loading />}
      {r && (
        <div className="g-grid">
          <section className="g-card">
            <div className="g-card__head"><h2>Rota do Clube</h2><span className="tag">{lunch} almoços · {dinner} jantas</span></div>
            {r.club.length === 0 ? <p className="muted">Sem entregas do Clube neste dia.</p> : (
              <table className="g-table">
                <thead><tr><th>Bairro</th><th>Almoço <small>{CLUB_WINDOWS.LUNCH}</small></th><th>Janta <small>{CLUB_WINDOWS.DINNER}</small></th></tr></thead>
                <tbody>{r.club.map((z) => <tr key={z.neighborhood}><td>{z.neighborhood}</td><td>{z.lunch}</td><td>{z.dinner}</td></tr>)}</tbody>
              </table>
            )}
          </section>
          <section className="g-card">
            <div className="g-card__head"><h2>Avulsos para entregar</h2><span className="tag">{r.pending.length} pedidos</span></div>
            {r.pending.length === 0 ? <p className="muted">Nenhum pedido esperando entrega.</p> : (
              <ul className="g-list">
                {r.pending.map((o) => (
                  <li key={o.id}>
                    <span><b>#{o.number}</b> {o.customerName}<small><Icon name="pin" size={13} /> {o.neighborhood} · {o.addressLine}</small></span>
                    <span className={`status status--${o.status.toLowerCase()}`}>{ORDER_STATUS_LABEL[o.status]}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="muted small">Agrupados por bairro para o motoboy levar vários de uma vez.</p>
          </section>
        </div>
      )}
    </div>
  );
}
