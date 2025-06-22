export default function ResumoFinanceiro({ contas }) {
  const totalGeral = contas
    .filter((c) => c.categoria !== "Entradas")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalEntradas = contas
    .filter((c) => c.categoria === "Entradas")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalNaoPagas = contas
    .filter((c) => c.categoria !== "Entradas" && !c.pago)
    .reduce((acc, curr) => acc + curr.valor, 0);

  const saldoFinal = totalEntradas - totalGeral;

  const cardClass =
    "flex-1 min-w-[220px] max-w-xs bg-gradient-to-br rounded-2xl shadow-lg p-5 flex flex-col items-center transition-transform transition-shadow duration-300 hover:-translate-y-2 hover:shadow-2xl";

  return (
    <div className="mt-8 flex flex-wrap gap-4 justify-center">
      <div className={`${cardClass} from-blue-100 to-blue-200`}>
        <span className="text-blue-700 text-3xl mb-2">💸</span>
        <div className="text-base font-semibold text-blue-900 mb-1">
          Total Despesas
        </div>
        <div className="font-bold text-red-600 text-2xl">
          R$ {totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </div>
      </div>
      <div className={`${cardClass} from-green-100 to-green-200`}>
        <span className="text-green-700 text-3xl mb-2">💰</span>
        <div className="text-base font-semibold text-green-900 mb-1">
          Total Entradas
        </div>
        <div className="font-bold text-green-700 text-2xl">
          R$ {totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </div>
      </div>
      <div className={`${cardClass} from-yellow-100 to-yellow-200`}>
        <span className="text-yellow-600 text-3xl mb-2">⏳</span>
        <div className="text-base font-semibold text-yellow-900 mb-1">
          Contas Não Pagas
        </div>
        <div className="font-bold text-yellow-700 text-2xl">
          R$ {totalNaoPagas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </div>
      </div>
      <div className={`${cardClass} from-blue-200 to-blue-300`}>
        <span className="text-blue-800 text-3xl mb-2">🧮</span>
        <div className="text-base font-bold text-blue-900 mb-1">
          Saldo Final
        </div>
        <div
          className={`font-bold text-2xl ${
            saldoFinal >= 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          R$ {saldoFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}
