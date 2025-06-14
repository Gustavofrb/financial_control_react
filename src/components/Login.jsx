import { useState } from "react";

export default function Login({ onLogin, onShowRegister, onShowResetSenha }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include", // ESSENCIAL!
    });
    const data = await res.json();
    if (res.ok) {
      onLogin(username, password);
    } else {
      setErro(data.error || "Erro ao fazer login");
    }
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
        {erro && <div className="text-red-600 text-sm">{erro}</div>}
      </form>
    </div>
  );
}
