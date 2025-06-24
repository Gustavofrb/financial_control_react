import { NumericFormat } from "react-number-format";
import { useState, useEffect } from "react";

export default function FormularioConta({ onAdicionar, categorias }) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState(categorias[0] || "");
  const [vencimento, setVencimento] = useState("");
  const [parcelas, setParcelas] = useState(1);
  
  useEffect(() => {
    if (!categorias.includes(categoria)) {
      setCategoria(categorias[0] || "");
    }
  }, [categorias]);

  const handleAdicionar = (e) => {
    e.preventDefault();
    const valorNum = parseFloat(valor.replace(",", "."));
    if (!descricao || !valorNum || !categoria) return;
    onAdicionar({
      descricao,
      valor: valorNum,
      categoria,
      vencimento,
      parcelas,
    });
    setDescricao("");
    setValor("");
    setVencimento("");
    setParcelas(1);
  };

  // Verifica se a categoria é "Entradas" (ignora acentos, espaços, maiúsculas)
  const isEntrada =
    categoria &&
    ["entrada", "entradas"].includes(
      categoria
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
    );

  return (
    <form onSubmit={handleAdicionar} className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="p-2 rounded border"
      />
      <NumericFormat
        className="border rounded p-2"
        value={valor}
        onValueChange={(values) => setValor(values.value)}
        thousandSeparator="."
        decimalSeparator=","
        prefix="R$ "
        allowNegative={false}
        placeholder="R$ 0,00"
        required
      />
      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        className="p-2 rounded border"
      >
        {categorias.map((cat) => (
          <option key={cat}>{cat}</option>
        ))}
      </select>
      <input
        type="date"
        value={vencimento}
        onChange={(e) => setVencimento(e.target.value)}
        className="p-2 rounded border"
      />
      <input
        type="number"
        min={1}
        value={parcelas}
        onChange={(e) => setParcelas(parseInt(e.target.value))}
        className="p-2 rounded border"
        placeholder="Parcelas"
      />
      <button
        type="submit"
        className={`
          flex items-center justify-center gap-2
          bg-gradient-to-r from-blue-600 to-blue-400
          text-white py-2 rounded-lg font-semibold
          shadow-md hover:from-green-500 hover:to-green-400
          hover:scale-105 active:scale-95 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-300
        `}
      >
        {isEntrada ? (
          <>
            <span className="text-lg">➕</span> Adicionar Entrada
          </>
        ) : (
          <>
            <span className="text-lg">💸</span> Adicionar Conta
          </>
        )}
      </button>
    </form>
  );
}
