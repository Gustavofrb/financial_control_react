import { useState } from "react";

export default function ResetSenha({ onVoltar }) {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");
    const res = await fetch("http://localhost:5000/reset-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setMensagem(data.message);
    } else {
      setErro(data.error || "Erro ao solicitar reset de senha");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-1 max-w-xs mx-auto p-2 bg-white rounded shadow"
      style={{ fontSize: "0.92rem" }}
    >
      <h2 className="text-base font-semibold text-center mb-1">
        Recuperar Senha
      </h2>
      <input
        type="email"
        placeholder="Seu e-mail cadastrado"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="p-1 border rounded text-sm"
        style={{ fontSize: "0.92rem" }}
      />
      <div className="flex gap-1 mt-1">
        <button
          type="submit"
          className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs"
        >
          Enviar
        </button>
        <button
          type="button"
          onClick={onVoltar}
          className="text-blue-600 underline px-2 py-1 text-xs"
        >
          Voltar
        </button>
      </div>
      {mensagem && (
        <div className="text-green-600 text-xs mt-1">{mensagem}</div>
      )}
      {erro && <div className="text-red-600 text-xs mt-1">{erro}</div>}
    </form>
  );
}
