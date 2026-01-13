"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/ContextoAuth";
import { useRouter } from "next/navigation";
import { FormularioPerfil } from "@/components/conta/FormularioPerfil";
import { GerenciadorEnderecos } from "@/components/conta/GerenciadorEnderecos";
import { FormularioAlterarSenha } from "@/components/conta/FormularioAlterarSenha";
import { Endereco } from "@/lib/definicoes";
import { buscarMeusEnderecos } from "@/lib/dados";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

const CarregandoSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
  </div>
);

export default function PaginaMinhaConta() {
  const [abaAtiva, setAbaAtiva] = useState<"perfil" | "enderecos">("perfil");
  const { usuario, carregando: carregandoAuth } = useAuth();
  const router = useRouter();

  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [carregandoEnderecos, setCarregandoEnderecos] = useState(true);

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenArmazenado = localStorage.getItem(AUTH_TOKEN_KEY);
    if (tokenArmazenado) {
      setToken(tokenArmazenado);
    }

    if (!carregandoAuth) {
      if (!usuario) {
        router.push("/login");
        return;
      }

      console.log("Usuário autenticado:", usuario);

      async function carregarEnderecos() {
        setCarregandoEnderecos(true);
        const dadosEnderecos = await buscarMeusEnderecos();
        setEnderecos(dadosEnderecos);
        setCarregandoEnderecos(false);
      }

      carregarEnderecos();
    }
  }, [usuario, carregandoAuth, router]);

  if (carregandoAuth || !usuario) {
    return <CarregandoSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#f0f3fd] pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Minha Conta</h1>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setAbaAtiva("perfil")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === "perfil"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Meus Dados
            </button>
            <button
              onClick={() => setAbaAtiva("enderecos")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === "enderecos"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Meus Endereços
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {abaAtiva === "perfil" && (
            <>
              <FormularioPerfil usuario={usuario} />
              <FormularioAlterarSenha />
            </>
          )}
          {abaAtiva === "enderecos" &&
            (carregandoEnderecos ? (
              <p>Carregando endereços...</p>
            ) : (
              // 3. Passe o token como prop para o GerenciadorEnderecos
              <GerenciadorEnderecos enderecosIniciais={enderecos} token={token} />
            ))}
        </div>
      </div>
    </div>
  );
}
