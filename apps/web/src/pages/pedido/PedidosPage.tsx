import { Link } from "react-router-dom";
import { ORDER_STATUS_LABEL, formatBRL } from "@feijuca/shared";
import { api } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import { getMyOrders } from "../../lib/storage";
import { TopBar } from "../../components/TopBar";
import { Icon } from "../../components/Icon";
import { Empty, Loading } from "../../components/StateViews";
import { Logo } from "../../components/Logo";

export function PedidosPage() {
  const ids = getMyOrders();
  const orders = useAsync(async () => (await Promise.allSettled(ids.map((id) => api.order(id))))
    .flatMap((r) => (r.status === "fulfilled" ? [r.value] : [])), [], 20000);

  return (
    <div className="page">
      <TopBar title="Meus pedidos" back={false} />
      {orders.loading && !orders.data && <Loading />}
      {orders.data?.length === 0 && (
        <Empty icon="receipt" title="Nenhum pedido ainda">
          <p>Seus pedidos feitos neste celular aparecem aqui.</p>
          <Link className="btn btn--primary" to="/">Fazer um pedido</Link>
        </Empty>
      )}
      <div className="list">
        {orders.data?.map((o) => (
          <Link key={o.id} to={`/pedido/${o.id}`} className="order-card">
            <Logo size={44} />
            <div className="order-card__text">
              <strong>Feijuca da Lu · #{o.number}</strong>
              <span className={`status status--${o.status.toLowerCase()}`}>{ORDER_STATUS_LABEL[o.status]}</span>
              <span className="muted small">
                {new Date(o.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                {" · "}{o.items.reduce((s, i) => s + i.quantity, 0)} itens · {formatBRL(o.totalCents)}
              </span>
            </div>
            <Icon name="chevron" size={18} />
          </Link>
        ))}
      </div>
    </div>
  );
}
