import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { clearAdminToken, getAdminToken } from "../../lib/storage";
import { Icon, type IconName } from "../../components/Icon";
import { Logo } from "../../components/Logo";

const LINKS: { to: string; label: string; icon: IconName }[] = [
  { to: "pedidos", label: "Pedidos", icon: "receipt" },
  { to: "cozinha", label: "Cozinha", icon: "chef" },
  { to: "entregas", label: "Entregas", icon: "bike" },
  { to: "caixa", label: "Caixa", icon: "cash" },
  { to: "assinantes", label: "Clube", icon: "users" },
  { to: "cardapio", label: "Cardápio", icon: "tag" },
];

/** Estrutura do painel: menu lateral no computador, abas no celular. */
export function GestaoLayout() {
  const navigate = useNavigate();
  if (!getAdminToken()) return <Navigate to="/gestao/login" replace />;

  return (
    <div className="gestao">
      <aside className="gestao__side">
        <div className="gestao__brand">
          <Logo size={40} />
          <div><strong>Feijuca da Lu</strong><span>Gestão</span></div>
        </div>
        <nav className="gestao__nav" aria-label="Gestão">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to}><Icon name={l.icon} size={20} /><span>{l.label}</span></NavLink>
          ))}
        </nav>
        <div className="gestao__foot">
          <a href="/" target="_blank" rel="noreferrer"><Icon name="store" size={18} /> Ver a loja</a>
          <button onClick={() => { clearAdminToken(); navigate("/gestao/login"); }}><Icon name="logout" size={18} /> Sair</button>
        </div>
      </aside>
      <main className="gestao__main">
        <Outlet />
      </main>
    </div>
  );
}
