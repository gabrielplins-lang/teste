import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { setAdminToken } from "../../lib/storage";
import { Field, TextInput } from "../../components/Field";
import { Logo } from "../../components/Logo";

export function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await api.login(password);
      setAdminToken(token);
      navigate("/gestao/pedidos", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <form className="login__card" onSubmit={submit}>
        <Logo size={88} />
        <h1>Gestão da loja</h1>
        <p className="muted">Pedidos, cozinha, entregas e Clube da Lu num lugar só.</p>
        <Field label="Senha">
          <TextInput id="senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required />
        </Field>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn--primary btn--block btn--lg" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
      </form>
    </div>
  );
}
