import { useState } from "react";

export default function Register({ onRegister, onShowLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // Novo estado para email
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    const res = await fetch("https://financial-control-ji39.onrender.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }), // Inclui email
    });
    const data = await res.json();
    if (res.ok) {
      setSucesso("Cadastro realizado! Faça login.");
      setTimeout(onShowLogin, 1500);
    } else {
      setErro(data.error || "Erro ao cadastrar");
    }
  };

  return (
    <div className="max-w-xs mx-auto mt-16 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Cadastro</h2>
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
          placeholder="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        {erro && <div className="text-red-600 text-sm">{erro}</div>}
        {sucesso && <div className="text-green-600 text-sm">{sucesso}</div>}
        <button
          className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
          type="submit"
        >
          Cadastrar
        </button>
      </form>
      <button className="mt-4 text-blue-700 underline" onClick={onShowLogin}>
        Já tem conta? Entrar
      </button>
    </div>
  );
}
