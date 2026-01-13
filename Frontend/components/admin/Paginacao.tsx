"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export function Paginacao({ totalPaginas }: { totalPaginas: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paginaAtual = Number(searchParams.get("page")) || 1;

  const criarUrlDaPagina = (numeroPagina: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", numeroPagina.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-center mt-6">
      <nav className="flex items-center gap-2">
        <Link
          href={criarUrlDaPagina(paginaAtual - 1)}
          className={`px-3 py-1 rounded-md ${
            paginaAtual <= 1 ? "pointer-events-none text-gray-400" : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FiChevronLeft />
        </Link>

        <span className="text-sm">
          Página {paginaAtual} de {totalPaginas}
        </span>

        <Link
          href={criarUrlDaPagina(paginaAtual + 1)}
          className={`px-3 py-1 rounded-md ${
            paginaAtual >= totalPaginas ? "pointer-events-none text-gray-400" : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FiChevronRight />
        </Link>
      </nav>
    </div>
  );
}
