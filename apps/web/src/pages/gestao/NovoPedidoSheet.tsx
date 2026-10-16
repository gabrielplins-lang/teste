import { useState } from "react";
import type { Channel, Fulfillment, PaymentMethod } from "@feijuca/shared";
import { adminCreateOrderSchema, formatBRL } from "@feijuca/shared";
import { api } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../context/ToastContext";
import { Sheet } from "../../components/Sheet";
import { Stepper } from "../../components/Stepper";
import { Field, TextInput } from "../../components/Field";
import { AddressFields, emptyAddress } from "../../components/AddressFields";

/** Lançar pedido que chegou por WhatsApp, telefone ou iFood. */
export function NovoPedidoSheet({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const catalog = useAsync(() => api.catalog());
  const store = useAsync(() => api.store());
  const toast = useToast();
  const [channel, setChannel] = useState<Exclude<Channel, "CLUB">>("WHATSAPP");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("DELIVERY");
  const [address, setAddress] = useState(emptyAddress);
  const [payment, setPayment] = useState<PaymentMethod>("PIX");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const products = catalog.data?.flatMap((c) => c.products) ?? [];
  const subtotal = products.reduce((s, p) => s + (qty[p.id] ?? 0) * p.priceCents, 0);

  const submit = async () => {
    setError(null);
    const parsed = adminCreateOrderSchema.safeParse({
      channel,
      order: {
        customer: { name, phone },
        fulfillment,
        address: fulfillment === "DELIVERY" ? address : undefined,
        paymentMethod: channel === "IFOOD" ? "IFOOD" : payment,
        items: Object.entries(qty).filter(([, q]) => q > 0).map(([productId, quantity]) => ({ productId, quantity })),
      },
    });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Confira os dados"); return; }
    setSending(true);
    try {
      const o = await api.admin.createOrder(parsed.data);
      toast(`Pedido #${o.number} lançado`);
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao lançar pedido");
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet open onClose={onClose} title="Lançar pedido" className="sheet--wide"
      footer={<button className="btn btn--primary btn--block btn--lg" onClick={submit} disabled={sending}>
        <span>{sending ? "Lançando…" : "Lançar na fila"}</span><span>{formatBRL(subtotal)}</span></button>}>
      <div className="segmented">
        {(["WHATSAPP", "APP", "IFOOD"] as const).map((c) => (
          <button key={c} className={channel === c ? "is-on" : ""} onClick={() => setChannel(c)}>
            {c === "WHATSAPP" ? "WhatsApp / telefone" : c === "APP" ? "Balcão" : "iFood"}
          </button>
        ))}
      </div>

      <h3 className="section-label">Itens</h3>
      <div className="admin-items">
        {products.map((p) => (
          <div key={p.id} className="admin-item">
            <span><strong>{p.name}</strong><small>{formatBRL(p.priceCents)}</small></span>
            <Stepper size="sm" value={qty[p.id] ?? 0} onChange={(v) => setQty({ ...qty, [p.id]: v })} />
          </div>
        ))}
      </div>

      <h3 className="section-label">Cliente</h3>
      <div className="form-row">
        <Field label="Nome"><TextInput id="n-nome" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="WhatsApp"><TextInput id="n-whats" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" /></Field>
      </div>

      <div className="segmented">
        {(["DELIVERY", "PICKUP"] as const).map((f) => (
          <button key={f} className={fulfillment === f ? "is-on" : ""} onClick={() => setFulfillment(f)}>{f === "DELIVERY" ? "Entrega" : "Retirada"}</button>
        ))}
      </div>
      {fulfillment === "DELIVERY" && <AddressFields value={address} onChange={setAddress} zones={store.data?.zones ?? []} idPrefix="n" />}

      {channel !== "IFOOD" && (
        <>
          <h3 className="section-label">Pagamento</h3>
          <div className="segmented">
            {(["PIX", "CARD", "CASH"] as const).map((m) => (
              <button key={m} className={payment === m ? "is-on" : ""} onClick={() => setPayment(m)}>{m === "PIX" ? "Pix" : m === "CARD" ? "Cartão" : "Dinheiro"}</button>
            ))}
          </div>
        </>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
    </Sheet>
  );
}
