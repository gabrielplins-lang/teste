import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export function Loading({ label = "Carregando…" }: { label?: string }) {
  return <div className="state"><span className="spinner" aria-hidden="true" /><p>{label}</p></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state">
      <p>{message}</p>
      {onRetry && <button className="btn btn--ghost" onClick={onRetry}><Icon name="refresh" size={18} /> Tentar de novo</button>}
    </div>
  );
}

export function Empty({ icon, title, children }: { icon: IconName; title: string; children?: ReactNode }) {
  return (
    <div className="state">
      <span className="state__icon"><Icon name={icon} size={30} /></span>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
