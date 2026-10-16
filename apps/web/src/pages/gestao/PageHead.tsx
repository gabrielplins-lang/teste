import type { ReactNode } from "react";
import { addDays, todayInBrazil } from "@feijuca/shared";
import { Icon } from "../../components/Icon";

/** Cabeçalho das telas de gestão, com seletor de dia quando a tela é diária. */
export function PageHead({ title, subtitle, date, onDate, actions }: {
  title: string;
  subtitle?: string;
  date?: string;
  onDate?: (d: string) => void;
  actions?: ReactNode;
}) {
  const today = todayInBrazil();
  return (
    <header className="g-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      <div className="g-head__actions">
        {date && onDate && (
          <div className="date-switch">
            <button onClick={() => onDate(addDays(date, -1))} aria-label="Dia anterior"><Icon name="back" size={18} /></button>
            <input type="date" id="dia" value={date} onChange={(e) => e.target.value && onDate(e.target.value)} />
            <button onClick={() => onDate(addDays(date, 1))} aria-label="Próximo dia"><Icon name="chevron" size={18} /></button>
            {date !== today && <button className="date-switch__today" onClick={() => onDate(today)}>Hoje</button>}
          </div>
        )}
        {actions}
      </div>
    </header>
  );
}
