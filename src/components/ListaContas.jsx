import { useState } from "react";
import ResumoFinanceiro from "./ResumoFinanceiro";

const icons = {
  pago: "✅",
  pagar: "💸",
  editar: "✏️",
  remover: "🗑️",
};

export default function ListaContas({
  contas,
  onTogglePago,
  onRemover,
  onEditar,
  categorias,
}) {
  const [contaEditando, setContaEditando] = useState(null);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [parcelas, setParcelas] = useState(1);

  const iniciarEdicao = (conta) => {
    setContaEditando(conta.id);
    setDescricao(conta.descricao);
    setValor(conta.valor);
    setVencimento(conta.vencimento || "");
    setParcelas(conta.parcelas || 1);
  };

  const salvarEdicao = () => {
    onEditar({
      ...contas.find((c) => c.id === contaEditando),
      descricao,
      valor: Number(valor),
      vencimento,
      parcelas: Number(parcelas),
    });
    setContaEditando(null);
    setDescricao("");
    setValor("");
    setVencimento("");
    setParcelas(1);
  };

  const cancelarEdicao = () => {
    setContaEditando(null);
    setDescricao("");
    setValor("");
    setVencimento("");
    setParcelas(1);
  };

  const totalPorCategoria = (cat) =>
    contas
      .filter((c) => c.categoria === cat)
      .reduce((acc, curr) => acc + curr.valor, 0);

  return (
    <>
      {categorias.map((cat) => (
        <div key={cat} className="mb-4">
          <h2 className="text-xl font-semibold mb-2">{cat}</h2>
          <div className="space-y-3">
            {contas
              .filter((c) => c.categoria === cat)
              .map((conta) =>
                contaEditando === conta.id ? (
                  <div
                    key={conta.id}
                    className="bg-yellow-50 p-3 rounded flex flex-col gap-2"
                  >
                    <input
                      type="text"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      className="p-1 rounded border"
                    />
                    <input
                      type="number"
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      className="p-1 rounded border"
                    />
                    <input
                      type="date"
                      value={vencimento}
                      onChange={(e) => setVencimento(e.target.value)}
                      className="p-1 rounded border"
                    />
                    <input
                      type="number"
                      min={1}
                      value={parcelas}
                      onChange={(e) => setParcelas(e.target.value)}
                      className="p-1 rounded border"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={salvarEdicao}
                        className="px-2 py-1 bg-green-600 text-white rounded"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={cancelarEdicao}
                        className="px-2 py-1 bg-gray-400 text-white rounded"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={conta.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white rounded shadow p-3 border hover:shadow-lg transition ${
                      conta.pago ? "opacity-60" : ""
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{conta.descricao}</div>
                      <div className="text-gray-600 text-sm">
                        Valor:{" "}
                        <span className="font-bold text-green-700">
                          R${" "}
                          {Number(conta.valor).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        {" | "}Vencimento: {conta.vencimento || "-"}
                        {conta.parcelas && conta.parcelas > 1
                          ? ` | Parcelas: ${conta.parcelas}`
                          : ""}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {/* Só mostra o botão de pago se NÃO for entrada/entradas */}
                      {conta.categoria &&
                        !["entrada", "entradas"].includes(
                          conta.categoria
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .trim()
                            .toLowerCase()
                        ) && (
                          <button
                            title={
                              conta.pago
                                ? "Desmarcar como pago"
                                : "Marcar como pago"
                            }
                            onClick={() => onTogglePago(conta.id)}
                            className={`px-3 py-2 rounded-full text-lg transition ${
                              conta.pago
                                ? "bg-gray-200 text-gray-600"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {conta.pago ? icons.pago : icons.pagar}
                          </button>
                        )}
                      <button
                        title="Editar"
                        onClick={() => iniciarEdicao(conta)}
                        className="px-3 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 text-lg transition"
                      >
                        {icons.editar}
                      </button>
                      <button
                        title="Remover"
                        onClick={() => onRemover(conta.id)}
                        className="px-3 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 text-lg transition"
                      >
                        {icons.remover}
                      </button>
                    </div>
                  </div>
                )
              )}
          </div>
          <div className="text-right mt-2 font-semibold">
            Total: R${" "}
            {totalPorCategoria(cat).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
      ))}
      <ResumoFinanceiro contas={contas} />
    </>
  );
}
