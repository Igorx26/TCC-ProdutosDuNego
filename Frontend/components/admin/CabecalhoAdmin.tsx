"use client";

import React from "react";
import { DisplayAutenticacao } from "../DisplayAutenticacao"; // 1. Importando para reutilizar

// Ícone do menu hambúrguer
const IconeMenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
    <path d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128ZM40,84H216a12,12,0,0,0,0-24H40a12,12,0,0,0,0,24Zm176,88H40a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Z"></path>
  </svg>
);

interface CabecalhoAdminProps {
  setSidebarAberta: (aberta: boolean) => void;
}

export function CabecalhoAdmin({ setSidebarAberta }: CabecalhoAdminProps) {
  return (
    <header className="bg-[#f0f3fd] shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarAberta(true)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            aria-label="Abrir menu"
          >
            <IconeMenu />
          </button>
          <h1 className="text-xl font-semibold">Painel Administrativo</h1>
        </div>
        <div>
          <DisplayAutenticacao />
        </div>
      </div>
    </header>
  );
}
