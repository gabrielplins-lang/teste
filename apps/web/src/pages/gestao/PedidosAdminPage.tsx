import { useState } from "react";
import type { OrderDTO, OrderStatus } from "@feijuca/shared";
import { CHANNEL_LABEL, NEXT_STATUS, ORDER_STATUS_LABEL, PAYMENT_LABEL, formatBRL, todayInBrazil } from "@feijuca/shared";
import { api } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../context/ToastContext";
import { formatPhone, whatsappLink } from "../../lib/whatsapp";
import { Icon } from "../../components/Icon";
import { ErrorState, Loading } from "../../components/StateViews";
import { PageHead } from "./PageHead";
import { NovoPedidoSheet } from "./NovoPedidoSheet";

const COLUMNS: { status: OrderStatus; title: string }[] = [
  { status: "NEW", title: "Novos" },
  { status: "PREPARING", title: "Em preparo" },
  { status: "OUT_FOR_DELIVERY", title: "Saiu / pronto" },
  { status: "DELIVERED", title: "Entregues" },
];

const ACTION: Partial<Record<OrderStatus, string>> = {
  NEW: "Aceitar",
  PREPARING: "Saiu para entrega",
  OUT_FOR_DELIVERY: "Confirmar entrega",
};

const minutesAgo = (iso: string) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));

export function PedidosAdminPage() {
  const [date, setDate] = useState(todayInBrazil());
  const orders = useAsync(() => api.admin.orders(date), [date], 20000);
  const [creating, setCreating] = useState(false);
  const [mobileCol, setMobileCol] = useState<OrderStatus>("NEW");
  const toast = useToast();

  const list = orders.data ?? [];
  const open = list.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELED").length;

  const advance = async (o: OrderDTO) => {
    const next = NEXT_STATUS[o.status];
    if (!next) return;
    try {
      await api.admin.setStatus(o.id, next);
      toast(`#${o.number}: ${ORDER_STATUS_LABEL[next]}`);
      orders.reload();
    } catch (e) { toast(e instanceof Error ? e.message : "Erro"); }
  };
  const cancel = async (o: OrderDTO) => {
    try { await api.admin.setStatus(o.id, "CANCELED"); toast(`#${o.number} cancelado`); orders.reload(); }
    catch (e) { toast(e instanceof Error ? e.message : "Erro"); }
  };
  const paid = async (o: OrderDTO) => {
    try { await api.admin.markPaid(o.id); toast(`#${o.number} marcado como pago`); orders.reload(); }
    catch (e) { toast(e instanceof Error ? e.message : "Erro"); }
  };

  return (
    <div className="g-page">
      <PageHead title="Pedidos" subtitle={`${list.length} pedidos · ${open} em aberto`} date={date} onDate={setDate}
        actions={<button className="btn btn--primary" onClick={() => setCreating(true)}><Icon name="plus" size={18} /> Novo pedido</button>} />

      {orders.loading && !orders.data && <Loading />}
      {orders.error && <ErrorState message={orders.error} onRetry={orders.reload} />}

      <div className="col-tabs" role="tablist">
        {COLUMNS.map((c) => (
          <button key={c.status} role="tab" aria-selected={mobileCol === c.status} className={mobileCol === c.status ? "is-on" : ""} onClick={() => setMobileCol(c.status)}>
            {c.title} <b>{list.filter((o) => o.status === c.status).length}</b>
          </button>
        ))}
      </div>

      <div className="board">
        {COLUMNS.map((c) => {
          const items = list.filter((o) => o.status === c.status);
          return (
            <section key={c.status} className={`board__col board__col--${c.status.toLowerCase()} ${mobileCol === c.status ? "is-mobile-on" : ""}`}>
              <h2>{c.title} <span>{items.length}</span></h2>
              {items.length === 0 && <p className="board__empty">Nenhum pedido</p>}
              {items.map((o) => (
                <article key={o.id} className="ticket">
                  <header>
                    <strong>#{o.number}</strong>
                    <span className={`chan chan--${o.channel.toLowerCase()}`}>{CHANNEL_LABEL[o.channel]}</span>
                    <span className="ticket__time">{minutesAgo(o.createdAt)} min</span>
                  </header>
                  <p className="ticket__who">{o.customerName} · <a href={whatsappLink(`Oi ${o.customerName.split(" ")[0]}! Aqui é da Feijuca da Lu, sobre o pedido #${o.number}.`, `55${o.customerPhone.replace(/^55/, "")}`)} target="_blank" rel="noreferrer">{formatPhone(o.customerPhone)}</a></p>
                  <ul className="ticket__items">
                    {o.items.map((i, k) => <li key={k}><b>{i.quantity}×</b> {i.name}{i.notes && <em> · {i.notes}</em>}</li>)}
                  </ul>
                  {o.notes && <p className="ticket__note">{o.notes}</p>}
                  <p className="ticket__meta">
                    {o.fulfillment === "PICKUP" ? "Retirada" : <span className="ticket__hood"><Icon name="pin" size={14} />{o.neighborhood}</span>}
                    {" · "}{formatBRL(o.totalCents)} · {PAYMENT_LABEL[o.paymentMethod]}
                    {o.changeForCents ? ` (troco p/ ${formatBRL(o.changeForCents)})` : ""}
                    {o.paymentStatus === "PENDING" && o.paymentMethod !== "IFOOD"
                      ? <button className="pill-btn" onClick={() => paid(o)}>a receber · marcar pago</button>
                      : <span className="paid">pago</span>}
                  </p>
                  {o.addressLine && <p className="ticket__addr">{o.addressLine}</p>}
                  {ACTION[o.status] && (
                    <div className="ticket__actions">
                      <button className="btn btn--primary btn--sm" onClick={() => advance(o)}>{ACTION[o.status]}</button>
                      {o.status === "NEW" && <button className="btn btn--ghost btn--sm" onClick={() => cancel(o)}>Recusar</button>}
                    </div>
                  )}
                </article>
              ))}
            </section>
          );
        })}
      </div>

      {creating && <NovoPedidoSheet onClose={() => setCreating(false)} onCreated={() => { setCreating(false); orders.reload(); }} />}
    </div>
  );
}
