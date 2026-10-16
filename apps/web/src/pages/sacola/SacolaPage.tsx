import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Fulfillment, PaymentMethod } from "@feijuca/shared";
import { createOrderSchema, formatBRL } from "@feijuca/shared";
import { api } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import { useCart } from "../../context/CartContext";
import { addMyOrder, getSavedCustomer, saveCustomer } from "../../lib/storage";
import { TopBar } from "../../components/TopBar";
import { Icon, type IconName } from "../../components/Icon";
import { Stepper } from "../../components/Stepper";
import { ProductImage } from "../../components/ProductImage";
import { Field, TextInput } from "../../components/Field";
import { AddressFields, emptyAddress, type AddressValue } from "../../components/AddressFields";
import { Empty } from "../../components/StateViews";
import { Logo } from "../../components/Logo";

const PAYMENTS: { id: Exclude<PaymentMethod, "IFOOD">; icon: IconName; title: string; detail: string }[] = [
  { id: "PIX", icon: "pix", title: "Pix", detail: "Aprovação na hora" },
  { id: "CARD", icon: "card", title: "Cartão na entrega", detail: "Crédito ou débito na maquininha" },
  { id: "CASH", icon: "cash", title: "Dinheiro", detail: "Avise se precisar de troco" },
];

export function SacolaPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const store = useAsync(() => api.store());
  const saved = getSavedCustomer();

  const [fulfillment, setFulfillment] = useState<Fulfillment>("DELIVERY");
  const [name, setName] = useState(saved?.name ?? "");
  const [phone, setPhone] = useState(saved?.phone ?? "");
  const [address, setAddress] = useState<AddressValue>(saved ? { ...emptyAddress, ...saved } : emptyAddress);
  const [payment, setPayment] = useState<Exclude<PaymentMethod, "IFOOD">>("PIX");
  const [change, setChange] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const zones = store.data?.zones ?? [];
  const zone = zones.find((z) => z.neighborhood === address.neighborhood);
  const fee = fulfillment === "DELIVERY" ? zone?.feeCents ?? 0 : 0;
  const total = cart.subtotalCents + fee;
  const minimum = store.data?.minimumOrderCents ?? 0;
  const belowMinimum = cart.subtotalCents < minimum;

  if (cart.items.length === 0) {
    return (
      <div className="page">
        <TopBar title="Sacola" back="/" />
        <Empty icon="bag" title="Sua sacola está vazia">
          <p>Escolha uma feijoada ou um dos pratos da Lu.</p>
          <Link className="btn btn--primary" to="/">Ver cardápio</Link>
        </Empty>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = createOrderSchema.safeParse({
      customer: { name, phone },
      fulfillment,
      address: fulfillment === "DELIVERY" ? address : undefined,
      paymentMethod: payment,
      changeForCents: payment === "CASH" && change ? Math.round(parseFloat(change.replace(",", ".")) * 100) : undefined,
      notes: notes || undefined,
      items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity, notes: i.notes || undefined })),
    });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Confira os dados"); return; }
    setSending(true);
    try {
      const order = await api.createOrder(parsed.data);
      saveCustomer({ name, phone, ...address });
      addMyOrder(order.id);
      cart.clear();
      navigate(`/pedido/${order.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o pedido");
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="page checkout" onSubmit={submit}>
      <TopBar title="Sacola" back="/" action={<button type="button" className="link-btn" onClick={cart.clear}>Limpar</button>} />

      <section className="checkout__store">
        <Logo size={44} />
        <div>
          <strong>Feijuca da Lu</strong>
          <Link to="/" className="link">Adicionar mais itens</Link>
        </div>
      </section>

      <section className="checkout__block">
        <h2 className="section-label">Itens adicionados</h2>
        {cart.items.map((i) => (
          <div className="cart-item" key={i.key}>
            <ProductImage src={i.imageUrl} name={i.name} className="cart-item__img" />
            <div className="cart-item__text">
              <strong>{i.name}</strong>
              {i.notes && <span className="muted small">Obs.: {i.notes}</span>}
              <span className="price">{formatBRL(i.priceCents * i.quantity)}</span>
            </div>
            <Stepper size="sm" value={i.quantity} onChange={(q) => cart.setQuantity(i.key, q)} />
          </div>
        ))}
      </section>

      <section className="checkout__block">
        <div className="segmented" role="radiogroup" aria-label="Entrega ou retirada">
          {(["DELIVERY", "PICKUP"] as Fulfillment[]).map((f) => (
            <button type="button" key={f} role="radio" aria-checked={fulfillment === f}
              className={fulfillment === f ? "is-on" : ""} onClick={() => setFulfillment(f)}>
              {f === "DELIVERY" ? "Entrega" : "Retirar na loja"}
            </button>
          ))}
        </div>
        {fulfillment === "DELIVERY" ? (
          <>
            {zone && <p className="eta"><Icon name="bike" size={18} /> Chega em {zone.etaMin}–{zone.etaMax} min · entrega {formatBRL(zone.feeCents)}</p>}
            <AddressFields value={address} onChange={setAddress} zones={zones} idPrefix="entrega" />
          </>
        ) : (
          <p className="eta"><Icon name="pin" size={18} /> {store.data?.address}</p>
        )}
      </section>

      <section className="checkout__block">
        <h2 className="section-label">Seus dados</h2>
        <div className="form-grid">
          <Field label="Nome"><TextInput id="nome" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></Field>
          <Field label="WhatsApp" hint="Para avisar sobre o pedido">
            <TextInput id="whats" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="(21) 9 9999-9999" required />
          </Field>
        </div>
      </section>

      <section className="checkout__block">
        <h2 className="section-label">Pagamento</h2>
        <div className="pay-options" role="radiogroup" aria-label="Forma de pagamento">
          {PAYMENTS.map((p) => (
            <button type="button" key={p.id} role="radio" aria-checked={payment === p.id}
              className={`pay-option ${payment === p.id ? "is-on" : ""}`} onClick={() => setPayment(p.id)}>
              <Icon name={p.icon} />
              <span><strong>{p.title}</strong><small>{p.detail}</small></span>
              <span className="radio" aria-hidden="true" />
            </button>
          ))}
        </div>
        {payment === "CASH" && (
          <Field label="Troco para quanto?">
            <TextInput id="troco" value={change} onChange={(e) => setChange(e.target.value)} inputMode="decimal" placeholder="Ex.: 100,00 (deixe vazio se não precisar)" />
          </Field>
        )}
        <Field label="Observação do pedido">
          <TextInput id="obs-pedido" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: interfone quebrado, ligar ao chegar" />
        </Field>
      </section>

      <section className="checkout__block summary-lines">
        <div><span>Subtotal</span><span>{formatBRL(cart.subtotalCents)}</span></div>
        <div>
          <span>Taxa de entrega</span>
          <span>{fulfillment === "PICKUP" ? <b className="free">Grátis</b> : zone ? formatBRL(fee) : "Escolha o bairro"}</span>
        </div>
        <div className="summary-lines__total"><span>Total</span><span>{formatBRL(total)}</span></div>
      </section>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="checkout__bar">
        {belowMinimum && <p className="muted small">Pedido mínimo de {formatBRL(minimum)}</p>}
        <button className="btn btn--primary btn--block btn--lg" disabled={sending || belowMinimum}>
          {sending ? "Enviando…" : <><span>Fazer pedido</span><span>{formatBRL(total)}</span></>}
        </button>
      </div>
    </form>
  );
}
