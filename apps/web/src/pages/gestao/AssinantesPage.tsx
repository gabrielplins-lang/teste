import type { SubscriptionStatus } from "@feijuca/shared";
import { MEALS_LABEL, formatBRL, monthLabel } from "@feijuca/shared";
import { api } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import { formatPhone, whatsappLink } from "../../lib/whatsapp";
import { Empty, Loading } from "../../components/StateViews";
import { PageHead } from "./PageHead";

const STATUS: Record<SubscriptionStatus, [string, string]> = {
  ACTIVE: ["Ativo", "tag--ok"],
  PAUSED: ["Pausado", "tag--warn"],
  PAYMENT_FAILED: ["Pagamento falhou", "tag--bad"],
  CANCELED: ["Cancelado", ""],
};

export function AssinantesPage() {
  const subs = useAsync(() => api.admin.subscribers());
  const list = subs.data ?? [];
  const active = list.filter((s) => s.status === "ACTIVE");
  const revenue = active.reduce((s, x) => s + x.totalCents, 0);

  return (
    <div className="g-page">
      <PageHead title="Clube da Lu" subtitle="Assinantes e receita recorrente" />
      {subs.loading && !subs.data && <Loading />}
      <div className="kpis">
        <div className="kpi"><span>Assinantes ativos</span><b>{active.length}</b></div>
        <div className="kpi kpi--good"><span>Receita do Clube</span><b>{formatBRL(revenue)}</b></div>
        <div className="kpi kpi--bad"><span>Pagamento pendente</span><b>{list.filter((s) => s.status === "PAYMENT_FAILED").length}</b></div>
      </div>
      {subs.data && list.length === 0 ? (
        <Empty icon="users" title="Nenhum assinante ainda"><p>Divulgue o link /clube no Instagram e no WhatsApp.</p></Empty>
      ) : (
        <section className="g-card">
          <table className="g-table">
            <thead><tr><th>Cliente</th><th>Plano</th><th>Bairro</th><th>Mês</th><th>Valor</th><th>Situação</th></tr></thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id}>
                  <td><b>{s.customerName}</b><br /><a href={whatsappLink(`Oi ${s.customerName.split(" ")[0]}! Aqui é da Feijuca da Lu.`, `55${s.customerPhone.replace(/^55/, "")}`)} target="_blank" rel="noreferrer" className="small">{formatPhone(s.customerPhone)}</a></td>
                  <td>{MEALS_LABEL[s.meals]}{s.people > 1 ? ` · ${s.people} pessoas` : ""}</td>
                  <td>{s.neighborhood ?? "—"}</td>
                  <td>{monthLabel(s.month)}</td>
                  <td>{formatBRL(s.totalCents)}</td>
                  <td><span className={`tag ${STATUS[s.status][1]}`}>{STATUS[s.status][0]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
