import { useParams } from "react-router-dom";
import type { OrderStatus } from "@feijuca/shared";
import { ORDER_STATUS_LABEL, PAYMENT_LABEL, formatBRL } from "@feijuca/shared";
import { api } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../context/ToastContext";
import { whatsappLink } from "../../lib/whatsapp";
import { TopBar } from "../../components/TopBar";
import { Icon } from "../../components/Icon";
import { ErrorState, Loading } from "../../components/StateViews";

const STEPS: OrderStatus[] = ["NEW", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
const STEP_TEXT: Record<OrderStatus, string> = {
  NEW: "A Lu recebeu seu pedido",
  PREPARING: "Seu pedido está sendo preparado",
  OUT_FOR_DELIVERY: "O motoboy está a caminho",
  DELIVERED: "Pedido entregue. Bom apetite!",
  CANCELED: "Pedido cancelado",
};

export function PedidoPage() {
  const { id = "" } = useParams();
  const order = useAsync(() => api.order(id), [id], 15000);
  const store = useAsync(() => api.store());
  const toast = useToast();

  if (order.loading && !order.data) return <div className="page"><TopBar title="Pedido" back="/pedidos" /><Loading /></div>;
  if (!order.data) return <div className="page"><TopBar title="Pedido" back="/pedidos" /><ErrorState message={order.error ?? "Pedido não encontrado"} onRetry={order.reload} /></div>;

  const o = order.data;
  const current = STEPS.indexOf(o.status);
  const pix = store.data?.pix;
  const copyPix = async () => {
    try { await navigator.clipboard.writeText(pix!.key); toast("Chave Pix copiada"); } catch { toast(`Chave Pix: ${pix!.key}`); }
  };

  return (
    <div className="page pedido">
      <TopBar title={`Pedido #${o.number}`} back="/pedidos" />

      <section className="track">
        <p className="track__eyebrow">{o.fulfillment === "PICKUP" ? "Retirada na loja" : "Entrega"}</p>
        <h2 className="track__title">{STEP_TEXT[o.status]}</h2>
        {o.status !== "CANCELED" && (
          <ol className="track__steps">
            {STEPS.map((s, i) => (
              <li key={s} className={i < current ? "is-done" : i === current ? "is-now" : ""}>
                <span className="track__dot">{i < current && <Icon name="check" size={14} />}</span>
                <span>{s === "OUT_FOR_DELIVERY" && o.fulfillment === "PICKUP" ? "Pronto para retirar" : ORDER_STATUS_LABEL[s]}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {o.paymentMethod === "PIX" && o.paymentStatus === "PENDING" && pix && (
        <section className="pix-box">
          <div className="pix-box__head"><Icon name="pix" /><strong>Pague com Pix</strong></div>
          <p>Valor: <b>{formatBRL(o.totalCents)}</b> · Favorecido: {pix.name}</p>
          <button className="pix-box__key" onClick={copyPix}>
            <span>{pix.key}</span><Icon name="copy" size={18} />
          </button>
          <p className="muted small">Depois de pagar, mande o comprovante no WhatsApp. A Lu confirma e começa o preparo.</p>
        </section>
      )}

      <section className="checkout__block">
        <h2 className="section-label">Resumo</h2>
        {o.items.map((i, k) => (
          <div className="summary-item" key={k}>
            <span><b>{i.quantity}×</b> {i.name}{i.notes && <small className="muted"> · {i.notes}</small>}</span>
            <span>{formatBRL(i.unitPriceCents * i.quantity)}</span>
          </div>
        ))}
        <div className="summary-lines">
          <div><span>Subtotal</span><span>{formatBRL(o.subtotalCents)}</span></div>
          <div><span>Entrega</span><span>{o.deliveryFeeCents ? formatBRL(o.deliveryFeeCents) : <b className="free">Grátis</b>}</span></div>
          <div className="summary-lines__total"><span>Total</span><span>{formatBRL(o.totalCents)}</span></div>
        </div>
        <p className="muted small">Pagamento: {PAYMENT_LABEL[o.paymentMethod]}{o.changeForCents ? ` · troco para ${formatBRL(o.changeForCents)}` : ""}</p>
        {o.addressLine && <p className="muted small"><Icon name="pin" size={14} /> {o.addressLine} · {o.neighborhood}</p>}
      </section>

      <a className="btn btn--whats btn--block" target="_blank" rel="noreferrer"
        href={whatsappLink(`Oi, Lu! Sobre o meu pedido #${o.number}:`)}>
        <Icon name="whatsapp" /> Falar com a Lu no WhatsApp
      </a>
    </div>
  );
}
