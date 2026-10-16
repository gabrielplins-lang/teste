import { useState } from "react";
import { Link } from "react-router-dom";
import type { SubscriptionDayDTO } from "@feijuca/shared";
import {
  CLUB_MAX_PAUSES, CLUB_WINDOWS, FEIJOADA_SLUG, MEALS_LABEL, WEEKDAY_NAMES, clubUpcharge, formatBRL, monthDays,
  monthLabel, parseISODate,
} from "@feijuca/shared";
import { api } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../context/ToastContext";
import { getMySubscription } from "../../lib/storage";
import { TopBar } from "../../components/TopBar";
import { Icon } from "../../components/Icon";
import { Sheet } from "../../components/Sheet";
import { ProductImage } from "../../components/ProductImage";
import { Empty, ErrorState, Loading } from "../../components/StateViews";

export function MeuMesPage() {
  const id = getMySubscription();
  const sub = useAsync(() => (id ? api.subscription(id) : Promise.resolve(null)), [id]);
  const catalog = useAsync(() => api.catalog());
  const [open, setOpen] = useState<SubscriptionDayDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!id) {
    return (
      <div className="page">
        <TopBar title="Meu mês" back={false} />
        <Empty icon="calendar" title="Você ainda não é do Clube">
          <p>Assine e escolha os pratos do mês inteiro de uma vez.</p>
          <Link className="btn btn--primary" to="/clube">Conhecer o Clube da Lu</Link>
        </Empty>
      </div>
    );
  }
  if (sub.loading && !sub.data) return <div className="page"><TopBar title="Meu mês" back={false} /><Loading /></div>;
  if (!sub.data) return <div className="page"><TopBar title="Meu mês" back={false} /><ErrorState message={sub.error ?? "Assinatura não encontrada"} onRetry={sub.reload} /></div>;

  const s = sub.data;
  const products = catalog.data?.flatMap((c) => c.products) ?? [];
  const dishes = products.filter((p) => p.clubEligible);
  const bySlug = new Map(products.map((p) => [p.id, p]));
  const byDate = new Map(s.days.map((d) => [d.date, d]));
  const grid = monthDays(s.month, s.weekdays);
  const lead = grid[0].weekday;
  const pauses = s.days.filter((d) => d.paused).length;

  const change = async (day: SubscriptionDayDTO, input: { productId?: string; paused?: boolean }) => {
    setSaving(true);
    try {
      const updated = await api.updateDay(s.id, day.date, input);
      sub.setData(updated);
      setOpen(updated.days.find((d) => d.date === day.date) ?? null);
      toast(input.paused === true ? "Dia pausado. Vira crédito no próximo mês." : input.paused === false ? "Entrega retomada" : "Prato trocado");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Não foi possível alterar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page meumes">
      <TopBar title="Meu mês" back={false} />

      <section className="meumes__head">
        <span className="club-pill">Clube da Lu</span>
        <h2>Olá, {s.customerName.split(" ")[0]}!</h2>
        <p className="muted">{MEALS_LABEL[s.meals]} · {s.weekdays === 5 ? "seg a sex" : "seg a sáb"} · {s.people} {s.people > 1 ? "pessoas" : "pessoa"} · {monthLabel(s.month)}</p>
      </section>

      <section className="stats">
        <div><span>Total do mês</span><b>{formatBRL(s.totals.totalCents)}</b></div>
        <div className="stats__save"><span>Economia</span><b>{formatBRL(s.totals.savingsCents)}</b></div>
        <div><span>Refeições</span><b>{s.totals.mealsCount}</b></div>
        <div><span>Pausas</span><b>{pauses}/{CLUB_MAX_PAUSES}</b></div>
      </section>

      <section className="calendar">
        <div className="calendar__head">{["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}</div>
        <div className="calendar__grid">
          {Array.from({ length: lead }, (_, i) => <span key={`x${i}`} />)}
          {grid.map((g) => {
            const day = byDate.get(g.date);
            if (!day) return <span key={g.date} className="cal-day cal-day--off" title={g.holiday}><b>{g.day}</b>{g.holiday && <small>feriado</small>}</span>;
            const p = bySlug.get(day.productId);
            return (
              <button key={g.date} className={`cal-day ${day.paused ? "cal-day--paused" : ""} ${!day.canChange ? "cal-day--locked" : ""}`}
                onClick={() => setOpen(day)} aria-label={`${g.day}: ${day.paused ? "pausado" : day.productName}`}>
                <b>{g.day}</b>
                {day.paused ? <small>pausa</small> : <ProductImage src={p?.imageUrl ?? null} name={day.productName} className="cal-day__img" />}
              </button>
            );
          })}
        </div>
        <p className="muted small">Toque num dia para trocar o prato ou pausar. Entrega: almoço {CLUB_WINDOWS.LUNCH}, janta {CLUB_WINDOWS.DINNER}.</p>
      </section>

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? `${WEEKDAY_NAMES[new Date(open.date + "T12:00:00").getDay()]}, ${parseISODate(open.date).d}` : ""}
        footer={open && open.canChange ? (
          <button className="btn btn--ghost btn--block" disabled={saving || (!open.paused && pauses >= CLUB_MAX_PAUSES)} onClick={() => change(open, { paused: !open.paused })}>
            <Icon name="pause" size={18} /> {open.paused ? "Retomar entrega neste dia" : `Pausar este dia (${pauses}/${CLUB_MAX_PAUSES})`}
          </button>
        ) : undefined}>
        {open && (
          <>
            {!open.canChange && <p className="note">O prazo para mudar este dia acabou (20h da véspera).</p>}
            <div className="dish-list">
              {dishes.map((p) => {
                const on = !open.paused && open.productId === p.id;
                const extra = p.slug === FEIJOADA_SLUG ? clubUpcharge(p.priceCents, s.meals) : 0;
                return (
                  <button key={p.id} className={`dish-option ${on ? "is-on" : ""}`} disabled={!open.canChange || saving || on}
                    onClick={() => change(open, { productId: p.id })}>
                    <ProductImage src={p.imageUrl} name={p.name} className="dish-option__img" />
                    <span className="dish-option__name">{p.name}</span>
                    <span className="dish-option__extra">{extra ? `+ ${formatBRL(extra)}` : "incluso"}</span>
                    <span className="radio" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
}
