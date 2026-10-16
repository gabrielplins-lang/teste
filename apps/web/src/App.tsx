import { Navigate, Route, Routes } from "react-router-dom";
import { CustomerLayout } from "./components/CustomerLayout";
import { LojaPage } from "./pages/loja/LojaPage";
import { SacolaPage } from "./pages/sacola/SacolaPage";
import { PedidoPage } from "./pages/pedido/PedidoPage";
import { PedidosPage } from "./pages/pedido/PedidosPage";
import { ClubePage } from "./pages/clube/ClubePage";
import { MeuMesPage } from "./pages/clube/MeuMesPage";
import { GestaoLayout } from "./pages/gestao/GestaoLayout";
import { LoginPage } from "./pages/gestao/LoginPage";
import { PedidosAdminPage } from "./pages/gestao/PedidosAdminPage";
import { CozinhaPage } from "./pages/gestao/CozinhaPage";
import { EntregasPage } from "./pages/gestao/EntregasPage";
import { CaixaPage } from "./pages/gestao/CaixaPage";
import { AssinantesPage } from "./pages/gestao/AssinantesPage";
import { CardapioAdminPage } from "./pages/gestao/CardapioAdminPage";

export function App() {
  return (
    <Routes>
      {/* App do cliente */}
      <Route element={<CustomerLayout />}>
        <Route index element={<LojaPage />} />
        <Route path="clube" element={<ClubePage />} />
        <Route path="clube/meu-mes" element={<MeuMesPage />} />
        <Route path="pedidos" element={<PedidosPage />} />
      </Route>
      <Route path="sacola" element={<SacolaPage />} />
      <Route path="pedido/:id" element={<PedidoPage />} />

      {/* Gestão da Lu */}
      <Route path="gestao/login" element={<LoginPage />} />
      <Route path="gestao" element={<GestaoLayout />}>
        <Route index element={<Navigate to="pedidos" replace />} />
        <Route path="pedidos" element={<PedidosAdminPage />} />
        <Route path="cozinha" element={<CozinhaPage />} />
        <Route path="entregas" element={<EntregasPage />} />
        <Route path="caixa" element={<CaixaPage />} />
        <Route path="assinantes" element={<AssinantesPage />} />
        <Route path="cardapio" element={<CardapioAdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
