import Login from "./Login";
import Register from "./Register";

export default function LandingPage({
  showRegister,
  setShowRegister,
  onLogin,
  onShowResetSenha,
  erro,
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col">
      {/* Barra superior */}
      <header className="w-full bg-white shadow flex justify-between items-center px-8 py-3">
        <span className="text-xl font-bold text-blue-700">
          Controle Financeiro
        </span>
        <div className="flex gap-2">
          <button
            className={`px-4 py-1 rounded font-semibold transition ${
              !showRegister
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-blue-700 hover:bg-blue-200"
            }`}
            onClick={() => setShowRegister(false)}
            type="button"
          >
            Entrar
          </button>
          <button
            className={`px-4 py-1 rounded font-semibold transition ${
              showRegister
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-blue-700 hover:bg-blue-200"
            }`}
            onClick={() => setShowRegister(true)}
            type="button"
          >
            Cadastrar
          </button>
        </div>
      </header>

      {/* Conteúdo central em duas colunas */}
      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-col md:flex-row w-full max-w-4xl gap-8 px-4 py-8">
          {/* Texto à esquerda */}
          <div className="flex-1 flex flex-col justify-center mb-8 md:mb-0">
            <h1 className="text-3xl font-bold text-blue-800 mb-4 text-left">
              Seu futuro financeiro começa aqui!
            </h1>
            <p className="text-blue-900 text-lg text-left">
              Organize suas contas, visualize relatórios e alcance seus
              objetivos.
              <br />O{" "}
              <span className="font-semibold text-blue-700">
                Controle Financeiro
              </span>{" "}
              é a ferramenta simples e poderosa para transformar sua relação com
              o dinheiro.
            </p>
          </div>
          {/* Formulário à direita */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6">
              {showRegister ? (
                <Register
                  onRegister={() => setShowRegister(false)}
                  onShowLogin={() => setShowRegister(false)}
                />
              ) : (
                <Login
                  onLogin={onLogin}
                  onShowRegister={() => setShowRegister(true)}
                  onShowResetSenha={onShowResetSenha}
                  erro={erro}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
