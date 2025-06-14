import { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FormularioConta from "./components/FormularioConta";
import ListaContas from "./components/ListaContas";
import ResumoFinanceiro from "./components/ResumoFinanceiro";
import Login from "./components/Login";
import Register from "./components/Register";
import ResetSenha from "./components/ResetSenha";

const API_URL = "http://localhost:5000/contas"; // Altere para o endereço da sua API

export default function App() {
  const [contas, setContas] = useState([]);
  const [mesSelecionado, setMesSelecionado] = useState(
    new Date().getMonth() + 1
  );
  const [anoSelecionado, setAnoSelecionado] = useState(
    new Date().getFullYear()
  );
  const [userId, setUserId] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [erro, setErro] = useState("");
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [showResetSenha, setShowResetSenha] = useState(false);
  const [precisaTrocarSenha, setPrecisaTrocarSenha] = useState(false);

  // Carregar contas da API ao iniciar ou ao alterar
  useEffect(() => {
    if (!userId) return;
    fetch(API_URL, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setContas(data));
  }, [userId, mesSelecionado, anoSelecionado]);

  useEffect(() => {
    fetch("http://localhost:5000/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user_id) setUserId(data.user_id);
      });
  }, []);

  const contasFiltradas = contas.filter(
    (c) => c.mes === mesSelecionado && c.ano === anoSelecionado
  );

  // Adicionar conta (parcelada ou não)
  const adicionarConta = useCallback(
    async ({ descricao, valor, categoria, vencimento, parcelas }) => {
      let mes = mesSelecionado;
      let ano = anoSelecionado;
      const valorParcela = Math.round((Number(valor) / parcelas) * 100) / 100;
      let valorRestante = Number(valor);

      for (let i = 0; i < parcelas; i++) {
        if (mes > 12) {
          mes = 1;
          ano += 1;
        }
        let vencimentoAjustado = vencimento;
        if (vencimento) {
          const data = new Date(vencimento);
          data.setMonth(mes - 1);
          data.setFullYear(ano);
          vencimentoAjustado = data.toISOString().slice(0, 10);
        }
        const valorAtual =
          i === parcelas - 1
            ? Math.round(valorRestante * 100) / 100
            : valorParcela;
        valorRestante -= valorParcela;

        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            descricao: `${descricao}${
              parcelas > 1 ? ` (${i + 1}/${parcelas})` : ""
            }`,
            valor: valorAtual,
            categoria,
            vencimento: vencimentoAjustado,
            pago: false,
            mes,
            ano,
          }),
          credentials: "include", // <-- Adicione isto!
        });
        mes += 1;
      }
      // Recarrega as contas após adicionar
      fetch(API_URL, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => setContas(data));
    },
    [mesSelecionado, anoSelecionado, contas]
  );

  const removerConta = useCallback(
    async (id) => {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setContas(contas.filter((c) => c.id !== id));
    },
    [contas]
  );

  const alternarPago = useCallback(
    async (id) => {
      const conta = contas.find((c) => c.id === id);
      if (!conta) return;
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...conta, pago: !conta.pago }),
      });
      setContas(contas.map((c) => (c.id === id ? { ...c, pago: !c.pago } : c)));
    },
    [contas]
  );

  const editarConta = useCallback(
    async (contaEditada) => {
      await fetch(`${API_URL}/${contaEditada.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contaEditada),
      });
      setContas(
        contas.map((c) =>
          c.id === contaEditada.id ? { ...c, ...contaEditada } : c
        )
      );
    },
    [contas]
  );

  const gerarPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Relatório de Contas", 14, 15);

    autoTable(doc, {
      head: [["Descrição", "Valor (R$)", "Categoria", "Vencimento", "Pago"]],
      body: contasFiltradas.map((c) => [
        c.descricao,
        c.valor.toFixed(2),
        c.categoria,
        c.vencimento || "-",
        c.pago ? "Sim" : "Não",
      ]),
      startY: 25,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [22, 160, 133] },
      alternateRowStyles: { fillColor: [238, 238, 238] },
      margin: { left: 14, right: 14 },
    });

    doc.save("relatorio-contas.pdf"); // Download automático

    // Se quiser, pode remover as linhas abaixo:
    // const pdfBlob = doc.output("blob");
    // setPdfBlob(pdfBlob);
    // setShowShareOptions(true);
  }, [contasFiltradas]);

  const realizarLogin = async (username, password) => {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      setUserId(data.user_id);
      setPrecisaTrocarSenha(data.precisa_trocar_senha); // <-- Aqui!
      setErro("");
    } else {
      setErro(data.error || "Erro ao fazer login");
    }
  };

  // Função de logout
  const logout = async () => {
    await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    });
    setUserId(null);
    setErro("");
    setShowRegister(false);
    setShowResetSenha(false);
  };

  if (!userId) {
    if (showResetSenha) {
      return <ResetSenha onVoltar={() => setShowResetSenha(false)} />;
    }
    return showRegister ? (
      <Register
        onRegister={() => setShowRegister(false)}
        onShowLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={realizarLogin}
        onShowRegister={() => setShowRegister(true)}
        onShowResetSenha={() => setShowResetSenha(true)}
        erro={erro}
      />
    );
  }

  // Usuário logado: mostra o botão de logout
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">
            Controle Financeiro
          </h1>
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <div className="flex gap-2 justify-center mb-4">
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(Number(e.target.value))}
            className="p-2 rounded border"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {String(i + 1).padStart(2, "0")}
              </option>
            ))}
          </select>
          <select
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(Number(e.target.value))}
            className="p-2 rounded border"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const ano = new Date().getFullYear() - 2 + i;
              return (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              );
            })}
          </select>
        </div>
        <FormularioConta onAdicionar={adicionarConta} />
        <ListaContas
          contas={contasFiltradas}
          onTogglePago={alternarPago}
          onRemover={removerConta}
          onEditar={editarConta}
        />
        <button
          onClick={gerarPDF}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 block mx-auto"
        >
          Gerar PDF
        </button>
      </div>
    </div>
  );
}
