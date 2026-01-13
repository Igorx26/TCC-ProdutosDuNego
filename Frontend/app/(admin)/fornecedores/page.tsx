"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { buscarFornecedores } from "@/lib/dados";
import { Fornecedor } from "@/lib/definicoes";
import { useOrdenacao } from "@/lib/hooks";
import { FiSearch } from "react-icons/fi";

const IconeOrdenacao = ({ direcao }: { direcao: "asc" | "desc" | null }) => {
  if (!direcao) return <span className="text-gray-400">↕</span>;
  return direcao === "asc" ? <span className="text-blue-500">▲</span> : <span className="text-blue-500">▼</span>;
};

function TabelaFornecedores({
  fornecedores,
  solicitarOrdenacao,
  configOrdenacao,
}: {
  fornecedores: Fornecedor[];
  solicitarOrdenacao: (key: keyof Fornecedor) => void;
  configOrdenacao: { key: keyof Fornecedor; direcao: "asc" | "desc" } | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-3 font-semibold">
              <button onClick={() => solicitarOrdenacao("nomeVendedor")} className="flex items-center gap-1">
                VENDEDOR
                <IconeOrdenacao direcao={configOrdenacao?.key === "nomeVendedor" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold hidden md:table-cell">
              <button onClick={() => solicitarOrdenacao("empresa")} className="flex items-center gap-1">
                EMPRESA
                <IconeOrdenacao direcao={configOrdenacao?.key === "empresa" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold hidden lg:table-cell">
              <button onClick={() => solicitarOrdenacao("celularVendedor")} className="flex items-center gap-1">
                CELUAR
                <IconeOrdenacao direcao={configOrdenacao?.key === "celularVendedor" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {fornecedores.map((fornecedor) => (
            <tr key={fornecedor.id} className="border-b hover:bg-gray-100">
              <td className="p-3 font-medium text-gray-900">{fornecedor.nomeVendedor}</td>
              <td className="p-3 hidden md:table-cell">{fornecedor.empresa || "N/A"}</td>
              <td className="p-3 hidden lg:table-cell">{fornecedor.celularVendedor}</td>
              <td className="p-3">
                <Link
                  href={`/fornecedores/${fornecedor.id}/editar`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PaginaFornecedores() {
  const [abaAtiva, setAbaAtiva] = useState<"ativos" | "inativos">("ativos");
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      const dados = await buscarFornecedores();
      setFornecedores(dados);
      setCarregando(false);
    }
    carregarDados();
  }, []);

  const fornecedoresFiltrados = useMemo(
    () =>
      fornecedores.filter(
        (f) =>
          f.nomeVendedor.toLowerCase().includes(filtro.toLowerCase()) ||
          (f.empresa || "").toLowerCase().includes(filtro.toLowerCase())
      ),
    [fornecedores, filtro]
  );

  const ativos = fornecedoresFiltrados.filter((f) => f.ativo);
  const inativos = fornecedoresFiltrados.filter((f) => !f.ativo);

  const {
    itens: ativosOrdenados,
    solicitarOrdenacao: ordenarAtivos,
    configOrdenacao: configAtivos,
  } = useOrdenacao(ativos);
  const {
    itens: inativosOrdenados,
    solicitarOrdenacao: ordenarInativos,
    configOrdenacao: configInativos,
  } = useOrdenacao(inativos);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">Gerenciar Fornecedores</h1>
        <Link
          href="/fornecedores/novo"
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Adicionar Fornecedor
        </Link>
      </div>

      <div className="relative w-full sm:w-1/3 mb-4">
        <input
          type="text"
          placeholder="Filtrar por vendedor ou empresa..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full rounded-md border border-gray-300 py-2 pl-10 text-sm outline-1 placeholder:text-gray-500"
        />
        <FiSearch className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setAbaAtiva("ativos")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              abaAtiva === "ativos"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Ativos ({ativos.length})
          </button>
          <button
            onClick={() => setAbaAtiva("inativos")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              abaAtiva === "inativos"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Inativos ({inativos.length})
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {carregando ? (
          <p className="text-center py-4">Carregando fornecedores...</p>
        ) : (
          <>
            {abaAtiva === "ativos" &&
              (ativos.length > 0 ? (
                <TabelaFornecedores
                  fornecedores={ativosOrdenados}
                  solicitarOrdenacao={ordenarAtivos}
                  configOrdenacao={configAtivos}
                />
              ) : (
                <p className="text-sm text-gray-500">Nenhum fornecedor ativo encontrado.</p>
              ))}
            {abaAtiva === "inativos" &&
              (inativos.length > 0 ? (
                <TabelaFornecedores
                  fornecedores={inativosOrdenados}
                  solicitarOrdenacao={ordenarInativos}
                  configOrdenacao={configInativos}
                />
              ) : (
                <p className="text-sm text-gray-500">Nenhum fornecedor inativo encontrado.</p>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
