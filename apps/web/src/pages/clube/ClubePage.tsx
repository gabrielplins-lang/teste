import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { Meals, Weekdays } from "@feijuca/shared";
import {
  CLUB_DISCOUNT, CLUB_MAX_PAUSES, CLUB_MAX_PEOPLE, CLUB_WINDOWS, FEIJOADA_SLUG, createSubscriptionSchema, deliveryDays,
  formatBRL, monthLabel, nextMonth, quoteClub,
} from "@feijuca/shared";
import { api } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import { getSavedCustomer, setMySubscription } from "../../lib/storage";
import { Icon } from "../../components/Icon";
import { Stepper } from "../../components/Stepper";
import { Field, TextInput } from "../../components/Field";
import { AddressFields, emptyAddress, type AddressValue } from "../../components/AddressFields";
import { ProductImage } from "../../components/ProductImage";
import { Logo } from "../../components/Logo";

const MEAL_OPTIONS: { id: Meals; title: string; detail: string }[] = [
  { id: "LUNCH", title: "Almoço", detail: CLUB_WINDOWS.LUNCH },
  { id: "DINNER", title: "Janta", detail: CLUB_WINDOWS.DINNER },
  { id: "BOTH", title: "Almoço e janta", detail: "Maior desconto" },
];

export function ClubePage() {
  const navigate = useNavigate();
  const catalog = useAsync(() => api.catalog());
  const store = useAsync(() => api.store());
  const saved = getSavedCustomer();
  const month = nextMonth();

  const [meals, setMeals] = useState<Meals>("BOTH");
  const [weekdays, setWeekdays] = useState<Weekdays>(5);
  const [people, setPeople] = useState(1);
  const [step, setStep] = useState<"plano" | "dados">("plano");
  const [name, setName] = useState(saved?.name ?? "");
  const [phone, setPhone] = useState(saved?.phone ?? "");
  const [lunch, setLunch] = useState<AddressValue>(saved ? { ...emptyAddress, ...saved } : emptyAddress);
  const [splitDinner, setSplitDinner] = useState(false);
  const [dinner, setDinner] = useState<AddressValue>(emptyAddress);
  const [payment, setPayment] = useState<"PIX" | "CARD">("PIX");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const products = catalog.data?.flatMap((c) => c.products) ?? [];
  const clubDishes = products.filter((p) => p.clubEligible);
  const feijoada = products.find((p) => p.slug === FEIJOADA_SLUG);
  const zones = store.data?.zones ?? [];

  const quote = useMemo(
    () => quoteClub({ month, meals, weekdays, people, feijoadaPriceCents: feijoada?.priceCents ?? 3500 }),
    [month, meals, weekdays, people, feijoada?.priceCents],
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const first = meals === "DINNER" ? undefined : lunch;
    const parsed = createSubscriptionSchema.safeParse({
      month, meals, weekdays, people, paymentMethod: payment,
      customer: { name, phone },
      lunchAddress: first,
      dinnerAddress: meals === "LUNCH" ? undefined : meals === "DINNER" ? lunch : splitDinner ? dinner : undefined,
    });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Confira os dados"); return; }
    setSending(true);
    try {
      const sub = await api.subscribe(parsed.data);
      setMySubscription(sub.id);
      navigate("/clube/meu-mes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a assinatura");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="clube">
      <section className="clube-hero">
        <Logo size={64} />
        <span className="clube-hero__brand">Clube da Lu</span>
        <h1>Comida caseira o mês inteiro, sem precisar pedir todo dia</h1>
        <p>Você escolhe os pratos do mês, paga uma vez e recebe almoço e janta em casa com até {Math.round(CLUB_DISCOUNT.BOTH * 100)}% de desconto.</p>
      </section>

      {step === "plano" ? (
        <>
          <ol className="how">
            <li><b>1</b><span><strong>Monte seu plano</strong>Almoço, janta ou os dois, para quantas pessoas quiser.</span></li>
            <li><b>2</b><span><strong>Escolha os pratos do mês</strong>Ou deixe a sugestão da Lu, com feijoada às quartas e sábados.</span></li>
            <li><b>3</b><span><strong>Receba em horário fixo</strong>Sem taxa de entrega e sem pedir de novo todo dia.</span></li>
          </ol>

          <section className="panel">
            <h2 className="section-label">Quais refeições?</h2>
            <div className="choice-grid choice-grid--3">
              {MEAL_OPTIONS.map((m) => (
                <button key={m.id} className={`choice ${meals === m.id ? "is-on" : ""}`} onClick={() => setMeals(m.id)} aria-pressed={meals === m.id}>
                  <strong>{m.title}</strong>
                  <small>{m.detail}</small>
                  <span className="choice__tag">-{Math.round(CLUB_DISCOUNT[m.id] * 100)}%</span>
                </button>
              ))}
            </div>

            <h2 className="section-label">Quais dias?</h2>
            <div className="choice-grid">
              {([5, 6] as Weekdays[]).map((w) => (
                <button key={w} className={`choice ${weekdays === w ? "is-on" : ""}`} onClick={() => setWeekdays(w)} aria-pressed={weekdays === w}>
                  <strong>{w === 5 ? "Segunda a sexta" : "Segunda a sábado"}</strong>
                  <small>{deliveryDays(month, w).length} dias em {monthLabel(month).split(" ")[0]}</small>
                </button>
              ))}
            </div>

            <div className="row-between">
              <div><h2 className="section-label">Pessoas</h2><p className="muted small">Mesma comida, mesmo endereço</p></div>
              <Stepper value={people} onChange={setPeople} min={1} max={CLUB_MAX_PEOPLE} />
            </div>
          </section>

          <section className="quote">
            <span className="quote__eyebrow">Seu plano de {monthLabel(month)}</span>
            <div className="quote__price">{formatBRL(quote.totalCents)}<small>/mês</small></div>
            <div className="quote__line"><span>{quote.mealsCount} refeições de {formatBRL(quote.unitPriceCents)}</span></div>
            <div className="quote__line"><span>Pedindo avulso, com entrega</span><s>{formatBRL(quote.retailCents)}</s></div>
            <div className="quote__line quote__save"><span>Você economiza</span><b>{formatBRL(quote.savingsCents)}</b></div>
            <p className="quote__note">Dias de feijoada somam {formatBRL(quote.feijoadaUpchargeCents)} por refeição. Feriados não são cobrados.</p>
          </section>

          {clubDishes.length > 0 && (
            <section className="panel">
              <h2 className="section-label">Pratos do Clube</h2>
              <div className="dish-rail">
                {clubDishes.map((p) => (
                  <div key={p.id} className="dish-chip">
                    <ProductImage src={p.imageUrl} name={p.name} className="dish-chip__img" />
                    <span>{p.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="panel rules">
            <h2 className="section-label">Combinados do Clube</h2>
            <ul>
              <li><Icon name="clock" size={18} /> Troque o prato até as 20h do dia anterior.</li>
              <li><Icon name="pause" size={18} /> Pause até {CLUB_MAX_PAUSES} dias no mês; eles viram crédito.</li>
              <li><Icon name="bike" size={18} /> Entrega grátis: almoço {CLUB_WINDOWS.LUNCH}, janta {CLUB_WINDOWS.DINNER}.</li>
              <li><Icon name="refresh" size={18} /> Renova todo mês; cancele com 7 dias de aviso.</li>
            </ul>
          </section>

          <div className="sticky-cta">
            <button className="btn btn--primary btn--block btn--lg" onClick={() => { setStep("dados"); window.scrollTo(0, 0); }}>
              <span>Quero assinar</span><span>{formatBRL(quote.totalCents)}</span>
            </button>
          </div>
        </>
      ) : (
        <form className="panel-stack" onSubmit={submit}>
          <button type="button" className="link-btn back-link" onClick={() => setStep("plano")}><Icon name="back" size={18} /> Voltar ao plano</button>

          <section className="panel">
            <h2 className="section-label">Seus dados</h2>
            <div className="form-grid">
              <Field label="Nome"><TextInput id="c-nome" value={name} onChange={(e) => setName(e.target.value)} required /></Field>
              <Field label="WhatsApp" hint="A Lu avisa por aqui quando o pedido sair">
                <TextInput id="c-whats" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" required />
              </Field>
            </div>
          </section>

          <section className="panel">
            <h2 className="section-label">{meals === "DINNER" ? "Endereço da janta" : "Endereço do almoço"}</h2>
            <AddressFields value={lunch} onChange={setLunch} zones={zones} idPrefix="c-almoco" showFee={false} />
            {meals === "BOTH" && (
              <label className="check">
                <input type="checkbox" checked={splitDinner} onChange={(e) => setSplitDinner(e.target.checked)} />
                <span>A janta vai para outro endereço</span>
              </label>
            )}
          </section>

          {meals === "BOTH" && splitDinner && (
            <section className="panel">
              <h2 className="section-label">Endereço da janta</h2>
              <AddressFields value={dinner} onChange={setDinner} zones={zones} idPrefix="c-janta" showFee={false} />
            </section>
          )}

          <section className="panel">
            <h2 className="section-label">Pagamento mensal</h2>
            <div className="pay-options">
              {([["PIX", "pix", "Pix", "Cobrança todo mês no Pix"], ["CARD", "card", "Cartão de crédito", "Cobrança recorrente no cartão"]] as const).map(([id, icon, t, d]) => (
                <button type="button" key={id} className={`pay-option ${payment === id ? "is-on" : ""}`} onClick={() => setPayment(id)} aria-pressed={payment === id}>
                  <Icon name={icon} /><span><strong>{t}</strong><small>{d}</small></span><span className="radio" aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="sticky-cta">
            <button className="btn btn--primary btn--block btn--lg" disabled={sending}>
              {sending ? "Criando…" : <><span>Assinar e escolher pratos</span><span>{formatBRL(quote.totalCents)}</span></>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
