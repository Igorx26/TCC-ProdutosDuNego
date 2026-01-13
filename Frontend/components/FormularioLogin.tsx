"use client";

import { useAuth } from "@/contexts/ContextoAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FormularioLogin() {
  const [nomeDeUsuario, setNomeDeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro("");
    setCarregando(true);

    const resultado = await login(nomeDeUsuario, senha);

    setCarregando(false);

    if (resultado.success && resultado.usuario) {
      console.log(resultado);
      if (resultado.usuario.admin) {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } else {
      setErro(resultado.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-900">Acessar sua Conta</h2>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4 rounded-md">
          <div>
            <label htmlFor="nomeUsuario" className="sr-only">
              Nome de Usuário
            </label>
            <input
              id="nomeUsuario"
              name="nomeUsuario"
              type="text"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="Nome de Usuário"
              value={nomeDeUsuario}
              onChange={(e) => setNomeDeUsuario(e.target.value)}
              disabled={carregando}
            />
          </div>
          <div>
            <label htmlFor="senha" className="sr-only">
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              minLength={6}
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={carregando}
            />
          </div>
        </div>

        {erro && <p className="text-sm text-center text-red-600">{erro}</p>}

        <div>
          <button
            type="submit"
            disabled={carregando}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-300"
          >
            {carregando ? "Entrando..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}
