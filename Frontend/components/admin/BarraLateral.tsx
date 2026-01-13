"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/ContextoAuth";
import {
  FiGrid,
  FiShoppingCart,
  FiPackage,
  FiTag,
  FiFileText,
  FiCreditCard,
  FiTruck,
  FiBriefcase,
  FiBarChart2,
  FiExternalLink,
  FiLogOut,
} from "react-icons/fi";

// Lista de links para o painel de admin
const linksAdmin = [
  { nome: "Dashboard", href: "/dashboard", icone: <FiGrid size={20} /> },
  { nome: "Vendas", href: "/vendas", icone: <FiShoppingCart size={20} /> },
  { nome: "Compras", href: "/compras", icone: <FiBriefcase size={20} /> },
  { nome: "Produtos", href: "/produtos", icone: <FiPackage size={20} /> },
  { nome: "Fornecedores", href: "/fornecedores", icone: <FiTruck size={20} /> },
  { nome: "Categorias", href: "/categorias", icone: <FiTag size={20} /> },
  { nome: "Formas de Pagamento", href: "/formasPagamento", icone: <FiCreditCard size={20} /> },
  { nome: "Medidas", href: "/medidas", icone: <FiFileText size={20} /> },
  { nome: "Relatórios", href: "/relatorios", icone: <FiBarChart2 size={20} /> },
];

interface BarraLateralProps {
  aberta: boolean;
  setAberta: (aberta: boolean) => void;
}

export function BarraLateral({ aberta, setAberta }: BarraLateralProps) {
  const pathname = usePathname();
  const { sair } = useAuth();

  return (
    <>
      {aberta && <div className="lg:hidden fixed inset-0 bg-black/50 z-20" onClick={() => setAberta(false)}></div>}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col flex-shrink-0 
                   transform transition-transform duration-300 ease-in-out 
                   ${aberta ? "translate-x-0" : "-translate-x-full"}
                   lg:relative lg:translate-x-0 lg:w-64`}
      >
        <div className="h-16 flex items-center justify-center text-2xl font-bold border-b border-gray-700">
          <Link href="/dashboard">Produtos Du Nego</Link>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {linksAdmin.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.nome}
                href={link.href}
                onClick={() => setAberta(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition duration-200 ${
                  isActive ? "bg-red-600" : "hover:bg-gray-700"
                }`}
              >
                {link.icone}
                <span>{link.nome}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-2 py-4 border-t border-gray-700 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm hover:bg-gray-700"
          >
            <FiExternalLink size={20} />
            Ver Loja
          </Link>
          <button
            onClick={() => sair()}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm text-red-400 hover:bg-red-900/50"
          >
            <FiLogOut size={20} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
