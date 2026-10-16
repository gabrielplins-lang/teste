import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Icon";

/** Barra do topo das telas internas: voltar, título centralizado e ação opcional. */
export function TopBar({ title, back = true, action }: { title: string; back?: boolean | string; action?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <header className="topbar">
      {back ? (
        <button className="icon-btn" onClick={() => (typeof back === "string" ? navigate(back) : navigate(-1))} aria-label="Voltar">
          <Icon name="back" />
        </button>
      ) : <span className="icon-btn" aria-hidden="true" />}
      <h1 className="topbar__title">{title}</h1>
      <div className="topbar__action">{action}</div>
    </header>
  );
}
