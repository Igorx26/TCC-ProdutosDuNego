// app/componentes/DisplayAutenticacao.tsx (Exemplo de caminho)

"use client";

import { useAuth } from "@/contexts/ContextoAuth"; // Ajuste o caminho se necessário
import Link from "next/link";
import { DropdownPerfil } from "./conta/DropdownPerfil";

export function DisplayAutenticacao() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    // É uma boa prática mostrar um indicador de carregamento
    // para evitar um "flash" do link de login antes do usuário ser carregado.
    return <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>;
  }

  return (
    <>
      {usuario ? (
        // O 'usuario' aqui agora é o objeto completo retornado pela sua API
        <DropdownPerfil usuario={usuario} />
      ) : (
        <Link href="/login" className="font-semibold text-base hover:text-red-600">
          Entrar
        </Link>
      )}
    </>
  );
}