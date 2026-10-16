import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { formatBRL } from "@feijuca/shared";
import { useCart } from "../context/CartContext";
import { Icon } from "./Icon";

/** Estrutura do app do cliente: conteúdo + barra da sacola + navegação inferior. */
export function CustomerLayout() {
  const { count, subtotalCents } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showBag = count > 0 && pathname === "/";

  return (
    <div className="shell">
      <main className="shell__main">
        <Outlet />
      </main>

      {showBag && (
        <button className="bagbar" onClick={() => navigate("/sacola")}>
          <span className="bagbar__count"><Icon name="bag" size={18} /><b>{count}</b></span>
          <span>Ver sacola</span>
          <span className="bagbar__total">{formatBRL(subtotalCents)}</span>
        </button>
      )}

      <nav className="bottomnav" aria-label="Navegação">
        <NavLink to="/" end><Icon name="home" /><span>Início</span></NavLink>
        <NavLink to="/clube" end><Icon name="star" /><span>Clube</span></NavLink>
        <NavLink to="/clube/meu-mes"><Icon name="calendar" /><span>Meu mês</span></NavLink>
        <NavLink to="/pedidos"><Icon name="receipt" /><span>Pedidos</span></NavLink>
      </nav>
    </div>
  );
}
