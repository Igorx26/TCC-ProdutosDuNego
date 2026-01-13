"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { buscarCategorias } from "@/lib/dados";
import { Categoria } from "@/lib/definicoes";
import { useOrdenacao } from "@/lib/hooks";
import { FiSearch } from "react-icons/fi";

// Componente de ícone (reutilizado)
const IconeOrdenacao = ({ direcao }: { direcao: "asc" | "desc" | null }) => {
  if (!direcao) return <span className="text-gray-400">↕</span>;
  return direcao === "asc" ? <span className="text-blue-500">▲</span> : <span className="text-blue-500">▼</span>;
};

// Componente para renderizar a tabela de categorias
function TabelaCategorias({
  categorias,
  solicitarOrdenacao,
  configOrdenacao,
}: {
  categorias: Categoria[];
  solicitarOrdenacao: (key: keyof Categoria) => void;
  configOrdenacao: { key: keyof Categoria; direcao: "asc" | "desc" } | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-3 font-semibold">
              <button onClick={() => solicitarOrdenacao("nome")} className="flex items-center gap-1">
                CATEGORIA
                <IconeOrdenacao direcao={configOrdenacao?.key === "nome" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold hidden md:table-cell">
              <button onClick={() => solicitarOrdenacao("descricao")} className="flex items-center gap-1">
                DESCRIÇÃO
                <IconeOrdenacao direcao={configOrdenacao?.key === "descricao" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold">AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.id} className="border-b hover:bg-gray-100">
              <td className="p-3 font-medium text-gray-900">{categoria.nome}</td>
              <td className="p-3 hidden md:table-cell">{categoria.descricao}</td>
              <td className="p-3">
                <Link href={`/categorias/${categoria.id}/editar`} className="text-blue-600 hover:underline font-medium">
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

// Componente principal da página
export default function PaginaCategorias() {
  const [abaAtiva, setAbaAtiva] = useState<"ativas" | "inativas">("ativas");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      const dadosCategorias = await buscarCategorias();
      setCategorias(dadosCategorias);
      setCarregando(false);
    }
    carregarDados();
  }, []);

  // Filtra as categorias com base no texto digitado
  const categoriasFiltradas = useMemo(
    () =>
      categorias.filter(
        (c) =>
          c.nome.toLowerCase().includes(filtro.toLowerCase()) ||
          (c.descricao || "").toLowerCase().includes(filtro.toLowerCase())
      ),
    [categorias, filtro]
  );

  const categoriasAtivas = categoriasFiltradas.filter((c) => c.ativo);
  const categoriasInativas = categoriasFiltradas.filter((c) => !c.ativo);

  const {
    itens: ativasOrdenadas,
    solicitarOrdenacao: ordenarAtivas,
    configOrdenacao: configAtivas,
  } = useOrdenacao(categoriasAtivas);
  const {
    itens: inativasOrdenadas,
    solicitarOrdenacao: ordenarInativas,
    configOrdenacao: configInativas,
  } = useOrdenacao(categoriasInativas);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">Gerenciar Categorias</h1>
        <Link
          href="/categorias/novo"
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Adicionar Categoria
        </Link>
      </div>

      <div className="relative w-full sm:w-1/3 mb-4">
        <input
          type="text"
          placeholder="Filtrar por nome ou descrição..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full rounded-md border border-gray-300 py-2 pl-10 text-sm outline-1 placeholder:text-gray-500"
        />
        <FiSearch className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setAbaAtiva("ativas")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              abaAtiva === "ativas"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Ativas ({categoriasAtivas.length})
          </button>
          <button
            onClick={() => setAbaAtiva("inativas")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              abaAtiva === "inativas"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Inativas ({categoriasInativas.length})
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {carregando ? (
          <p className="text-center py-4">Carregando categorias...</p>
        ) : (
          <>
            {abaAtiva === "ativas" &&
              (categoriasAtivas.length > 0 ? (
                <TabelaCategorias
                  categorias={ativasOrdenadas}
                  solicitarOrdenacao={ordenarAtivas}
                  configOrdenacao={configAtivas}
                />
              ) : (
                <p className="text-sm text-gray-500">Nenhuma categoria ativa encontrada.</p>
              ))}
            {abaAtiva === "inativas" &&
              (categoriasInativas.length > 0 ? (
                <TabelaCategorias
                  categorias={inativasOrdenadas}
                  solicitarOrdenacao={ordenarInativas}
                  configOrdenacao={configInativas}
                />
              ) : (
                <p className="text-sm text-gray-500">Nenhuma categoria inativa encontrada.</p>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
