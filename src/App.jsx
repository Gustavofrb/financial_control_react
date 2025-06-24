import { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FormularioConta from "./components/FormularioConta";
import ListaContas from "./components/ListaContas";
import ResumoFinanceiro from "./components/ResumoFinanceiro";
import Login from "./components/Login";
import Register from "./components/Register";
import ResetSenha from "./components/ResetSenha";
import LandingPage from "./components/LandingPage";

const API_URL = "https://financial-control-ji39.onrender.com/contas";

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
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [categorias, setCategorias] = useState([
    "Alimentação",
    "Moradia",
    "Transporte",
    "Lazer",
    "Saúde",
    "Outros",
    "Entradas",
  ]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [mensagem, setMensagem] = useState(""); // Para avisos
  const [mensagemTipo, setMensagemTipo] = useState(""); // "sucesso" ou "erro"

  // Carregar contas da API ao iniciar ou ao alterar
  useEffect(() => {
    if (!userId) return;
    fetch(API_URL, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setContas(data));
  }, [userId, mesSelecionado, anoSelecionado]);

  useEffect(() => {
    fetch("https://financial-control-ji39.onrender.com/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user_id) setUserId(data.user_id);
      });
  }, []);

  const contasFiltradas = contas.filter(
    (c) => c.mes === mesSelecionado && c.ano === anoSelecionado
  );

  // Função para exibir mensagem temporária
  const exibirMensagem = (msg, tipo = "sucesso") => {
    setMensagem(msg);
    setMensagemTipo(tipo);
    setTimeout(() => {
      setMensagem("");
      setMensagemTipo("");
    }, 3000);
  };

  // Adicionar conta (parcelada ou não)
  const adicionarConta = useCallback(
    async ({ descricao, valor, categoria, vencimento, parcelas }) => {
      let mes, ano;
      if (vencimento) {
        const data = new Date(vencimento);
        mes = data.getMonth() + 1;
        ano = data.getFullYear();
      } else {
        mes = mesSelecionado;
        ano = anoSelecionado;
      }
      const valorParcela = Math.round((Number(valor) / parcelas) * 100) / 100;
      let valorRestante = Number(valor);

      for (let i = 0; i < parcelas; i++) {
        let vencimentoAjustado = vencimento;
        if (vencimento) {
          const data = new Date(vencimento);
          data.setMonth(mes - 1 + i);
          data.setFullYear(ano + Math.floor((mes - 1 + i) / 12));
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
            mes: vencimento
              ? new Date(vencimentoAjustado).getMonth() + 1
              : mesSelecionado,
            ano: vencimento
              ? new Date(vencimentoAjustado).getFullYear()
              : anoSelecionado,
          }),
          credentials: "include",
        });
      }
      // Recarrega as contas após adicionar
      fetch(API_URL, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => setContas(data));
      if (
        categoria &&
        categoria
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
          .toLowerCase() === "entradas"
      ) {
        exibirMensagem("Entrada adicionada com sucesso!", "sucesso");
      } else {
        exibirMensagem("Conta adicionada com sucesso!", "sucesso");
      }
    },
    [mesSelecionado, anoSelecionado, contas]
  );

  const removerConta = useCallback(
    async (id) => {
      const conta = contas.find((c) => c.id === id);
      if (!conta) return;

      const match = conta.descricao.match(/^(.*)\s\(\d+\/(\d+)\)$/);
      let contasParaRemover = [];

      if (match) {
        const descricaoBase = match[1];
        const totalParcelas = Number(match[2]);
        contasParaRemover = contas.filter(
          (c) =>
            c.descricao.startsWith(descricaoBase) &&
            c.descricao.match(/\(\d+\/\d+\)$/) &&
            c.descricao.endsWith(`/${totalParcelas})`)
        );
      } else {
        // Se não for parcelada, remove só ela
        contasParaRemover = [conta];
      }

      // Remove todas as contas encontradas
      await Promise.all(
        contasParaRemover.map((c) =>
          fetch(`${API_URL}/${c.id}`, { method: "DELETE" })
        )
      );
      setContas(
        contas.filter((c) => !contasParaRemover.some((r) => r.id === c.id))
      );
      exibirMensagem("Conta removida com sucesso!", "sucesso");
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
  }, [contasFiltradas]);

  const realizarLogin = async (username, password) => {
    const res = await fetch(
      "https://financial-control-ji39.onrender.com/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      }
    );
    const data = await res.json();
    if (res.ok) {
      setUserId(data.user_id);
      setPrecisaTrocarSenha(data.precisa_trocar_senha);
      setErro("");
    } else {
      setErro(data.error || "Erro ao fazer login");
    }
  };

  // Função de logout
  const logout = async () => {
    await fetch("https://financial-control-ji39.onrender.com/logout", {
      method: "POST",
      credentials: "include",
    });
    setUserId(null);
    setErro("");
    setShowRegister(false);
    setShowResetSenha(false);
  };

  // Adicionar categoria (Entradas sempre última e única)
  const adicionarCategoria = (novaCategoria) => {
    const nova = novaCategoria.trim();
    if (!nova) return;
    if (
      nova.toLowerCase() === "entradas" ||
      categorias.map((c) => c.toLowerCase()).includes(nova.toLowerCase())
    ) {
      exibirMensagem("Categoria já existe!", "erro");
      return;
    }
    // Remove Entradas, adiciona nova, depois Entradas de novo
    const catsSemEntradas = categorias.filter(
      (cat) => cat.toLowerCase() !== "entradas"
    );
    setCategorias([...catsSemEntradas, nova, "Entradas"]);
    exibirMensagem("Categoria adicionada com sucesso!", "sucesso");
  };

  // Remover categoria (não remove Entradas)
  const removerCategoria = (categoria) => {
    if (categoria.toLowerCase() === "entradas") {
      exibirMensagem("A categoria 'Entradas' não pode ser removida!", "erro");
      return;
    }
    setCategorias(categorias.filter((cat) => cat !== categoria));
    exibirMensagem("Categoria removida com sucesso!", "sucesso");
  };

  // Função para mover categorias
  const moverCategoria = (indice, direcao) => {
    const catsSemEntradas = categorias.filter(
      (cat) => cat.toLowerCase() !== "entradas"
    );
    const novoIndice = indice + direcao;
    if (novoIndice < 0 || novoIndice >= catsSemEntradas.length) return;
    const novaLista = [...catsSemEntradas];
    [novaLista[indice], novaLista[novoIndice]] = [
      novaLista[novoIndice],
      novaLista[indice],
    ];
    setCategorias([...novaLista, "Entradas"]);
  };

  if (!userId) {
    if (showResetSenha) {
      return <ResetSenha onVoltar={() => setShowResetSenha(false)} />;
    }
    return (
      <LandingPage
        showRegister={showRegister}
        setShowRegister={setShowRegister}
        onLogin={realizarLogin}
        onShowResetSenha={() => setShowResetSenha(true)}
        erro={erro}
      />
    );
  }

  // Usuário logado: mostra o botão de logout
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8">
        {/* Avisos */}
        {mensagem && (
          <div
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-center font-semibold transition-all duration-300
      ${
        mensagemTipo === "sucesso"
          ? "bg-green-100 text-green-800 border border-green-300"
          : "bg-red-100 text-red-700 border border-red-300"
      }`}
            style={{ minWidth: 250, maxWidth: 400 }}
          >
            {mensagem}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">
            Controle Financeiro
          </h1>
          <button
            onClick={logout}
            title="Sair"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200 shadow hover:scale-110"
          >
            {/* SVG padrão de logout */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
              />
            </svg>
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
        <FormularioConta onAdicionar={adicionarConta} categorias={categorias} />

        {/* Painel destacado para a lista de contas */}
        <div className="mb-10 bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-inner">
          <ListaContas
            contas={contasFiltradas}
            onTogglePago={alternarPago}
            onRemover={removerConta}
            onEditar={editarConta}
            categorias={categorias}
          />
        </div>

        {/* Separador visual real */}
        <hr className="my-10 border-t-2 border-gray-200" />

        {/* Painel de categorias destacado e suave */}
        <div className="mb-10 bg-blue-50 border border-blue-100 rounded-lg p-6 shadow-inner">
          <h2 className="text-lg font-semibold text-blue-700 mb-4 text-center">
            Gerenciar Categorias
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-center mb-4 w-full">
            <input
              type="text"
              placeholder="Nova categoria"
              className="p-2 border rounded w-full sm:w-auto flex-1 min-w-0"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
            />
            <button
              onClick={() => {
                adicionarCategoria(novaCategoria);
                setNovaCategoria("");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto"
            >
              Adicionar Categoria
            </button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center items-center min-w-0 max-w-full">
            {categorias.map((cat, idx) => {
              const isEntradas = cat.toLowerCase() === "entradas";
              const catsSemEntradas = categorias.filter(
                (c) => c.toLowerCase() !== "entradas"
              );
              const isFirst = idx === 0;
              const isLast = idx === catsSemEntradas.length - 1;
              return (
                <span
                  key={cat}
                  className="flex items-center bg-gray-200 px-3 py-1 rounded-full"
                >
                  {cat}
                  {!isEntradas && (
                    <>
                      <button
                        onClick={() => moverCategoria(idx, -1)}
                        className="ml-2 text-gray-500 hover:text-blue-700 disabled:opacity-30"
                        title="Mover para cima"
                        disabled={isFirst}
                        style={{ fontSize: 18, lineHeight: 1 }}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moverCategoria(idx, 1)}
                        className="ml-1 text-gray-500 hover:text-blue-700 disabled:opacity-30"
                        title="Mover para baixo"
                        disabled={isLast}
                        style={{ fontSize: 18, lineHeight: 1 }}
                      >
                        ▼
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => removerCategoria(cat)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Remover categoria"
                    disabled={isEntradas}
                  >
                    &times;
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        <button
          onClick={gerarPDF}
          className="
  mt-6 flex items-center justify-center gap-2
  px-5 py-2.5
  bg-gradient-to-r from-blue-600 to-blue-400
  text-white rounded-lg font-semibold shadow-md
  hover:from-green-500 hover:to-green-400
  hover:scale-105 active:scale-95 transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-blue-300
  mx-auto
"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16v-8m0 8l-3-3m3 3l3-3M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Gerar PDF
        </button>
      </div>
    </div>
  );
}
