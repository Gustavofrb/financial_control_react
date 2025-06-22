import { useState, useEffect } from "react";

export default function Login({
  onLogin,
  onShowRegister,
  onShowResetSenha,
  erro,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [lembrar, setLembrar] = useState(false);

  // Recupera usuário salvo
  useEffect(() => {
    const salvo = localStorage.getItem("usuario_salvo");
    if (salvo) setUsername(salvo);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (lembrar) {
      localStorage.setItem("usuario_salvo", username);
    } else {
      localStorage.removeItem("usuario_salvo");
    }
    onLogin(username, password);
  };

  return (
    <div className="max-w-xs mx-auto mt-16 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className="border rounded p-2"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="border rounded p-2"
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lembrar}
            onChange={(e) => setLembrar(e.target.checked)}
          />
          Lembrar-me
        </label>
        {erro && <div className="text-red-600 text-sm">{erro}</div>}
        <button
          className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
          type="submit"
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={onShowRegister}
          className="mt-4 text-blue-700 underline"
        >
          Não tem conta? Cadastre-se
        </button>
        <button
          type="button"
          onClick={onShowResetSenha}
          className="text-blue-600 underline"
        >
          Esqueci minha senha
        </button>
      </form>
    </div>
  );
}
