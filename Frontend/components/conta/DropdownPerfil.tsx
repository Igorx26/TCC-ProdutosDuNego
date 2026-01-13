"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/ContextoAuth";
import { Usuario } from "@/lib/definicoes";
import Image from "next/image";

interface DropdownPerfilProps {
  usuario: Usuario;
}

export function DropdownPerfil({ usuario }: DropdownPerfilProps) {
  const [estaAberto, setEstaAberto] = useState(false);
  const { sair } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setEstaAberto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setEstaAberto(!estaAberto)} className="flex items-center gap-2">
        <Image
          src="/assets/LogoProdutosduNego.png"
          alt="Ícone do usuário"
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="hidden min-[480px]:inline font-medium text-base">{usuario.nome}</span>
      </button>

      {estaAberto && (
        <div className="absolute right-0 mt-2 w-48 bg-[#f0f3fd] rounded-md shadow-lg py-1 z-50">
          {usuario.admin && (
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm hover:bg-gray-200"
              onClick={() => setEstaAberto(false)} // Fecha ao clicar
            >
              Painel Administrativo
            </Link>
          )}
          <Link
            href="/minhaConta"
            className="block px-4 py-2 text-sm hover:bg-gray-200"
            onClick={() => setEstaAberto(false)} // Fecha ao clicar
          >
            Minha Conta
          </Link>
          <Link
            href="/meusPedidos"
            className="block px-4 py-2 text-sm hover:bg-gray-200"
            onClick={() => setEstaAberto(false)} // Fecha ao clicar
          >
            Meus Pedidos
          </Link>
          <div className="border-t border-gray-200"></div>
          <button
            onClick={() => {
              sair();
              setEstaAberto(false);
            }}
            className="w-full cursor-pointer text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-200"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
