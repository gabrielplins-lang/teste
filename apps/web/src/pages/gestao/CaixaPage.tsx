import { useState } from "react";
import { CHANNEL_FEE_RATE, CHANNEL_LABEL, formatBRL, todayInBrazil } from "@feijuca/shared";
import { api } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import { Loading } from "../../components/StateViews";
import { PageHead } from "./PageHead";

export function CaixaPage() {
  const [date, setDate] = useState(todayInBrazil());
  const report = useAsync(() => api.admin.cash(date), [date], 60000);
  const r = report.data;
  const gross = r?.channels.reduce((s, c) => s + c.grossCents, 0) ?? 0;
  const net = r?.channels.reduce((s, c) => s + c.netCents, 0) ?? 0;
  const ifood = r?.channels.find((c) => c.channel === "IFOOD");

  return (
    <div className="g-page">
      <PageHead title="Caixa" subtitle="Vendas por canal e quanto fica com você" date={date} onDate={setDate} />
      {report.loading && !r && <Loading />}
      {r && (
        <>
          <div className="kpis">
            <div className="kpi"><span>Vendido</span><b>{formatBRL(gross)}</b></div>
            <div className="kpi kpi--good"><span>Fica com você</span><b>{formatBRL(net)}</b></div>
            <div className="kpi kpi--bad"><span>Taxas do iFood</span><b>{formatBRL(ifood?.feeCents ?? 0)}</b></div>
            <div className="kpi"><span>Dinheiro a receber</span><b>{formatBRL(r.pendingCashCents)}</b></div>
          </div>
          <section className="g-card">
            <table className="g-table g-table--money">
              <thead><tr><th>Canal</th><th>Pedidos</th><th>Vendido</th><th>Taxa</th><th>Fica com você</th></tr></thead>
              <tbody>
                {r.channels.map((c) => (
                  <tr key={c.channel}>
                    <td><span className={`chan chan--${c.channel.toLowerCase()}`}>{CHANNEL_LABEL[c.channel]}</span></td>
                    <td>{c.orders}</td>
                    <td>{formatBRL(c.grossCents)}</td>
                    <td>{formatBRL(c.feeCents)} <small className="muted">({Math.round(CHANNEL_FEE_RATE[c.channel] * 1000) / 10}%)</small></td>
                    <td><b>{formatBRL(c.netCents)}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="muted small">Taxas estimadas: iFood Plano Entrega (23%) + pagamento online (~3,2%); app e Clube consideram ~1% de Pix/cartão. A linha do Clube soma as refeições entregues no dia.</p>
          </section>
        </>
      )}
    </div>
  );
}
