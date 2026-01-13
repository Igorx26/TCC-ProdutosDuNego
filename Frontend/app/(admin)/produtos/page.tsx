// app/(admin)/produtos/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react"; // Importar useMemo
import { buscarProdutos, buscarCategorias } from "@/lib/dados";
import { Categoria, Produto, ProdutoEnriquecido } from "@/lib/definicoes"; // Importar ProdutoEnriquecido
import { useOrdenacao } from "@/lib/hooks";
import { FiSearch } from "react-icons/fi";

const IconeOrdenacao = ({ direcao }: { direcao: "asc" | "desc" | null }) => {
  if (!direcao) return <span className="text-gray-400">↕</span>;
  return direcao === "asc" ? <span className="text-blue-500">▲</span> : <span className="text-blue-500">▼</span>;
};

function TabelaProdutos({
  produtos,
  solicitarOrdenacao,
  configOrdenacao,
}: {
  produtos: ProdutoEnriquecido[];
  solicitarOrdenacao: (key: keyof ProdutoEnriquecido) => void;
  configOrdenacao: { key: keyof ProdutoEnriquecido; direcao: "asc" | "desc" } | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-3 font-semibold">
              <button onClick={() => solicitarOrdenacao("nome")} className="flex items-center gap-1">
                PRODUTO <IconeOrdenacao direcao={configOrdenacao?.key === "nome" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold hidden md:table-cell">
              {/* Agora podemos ordenar por 'nomeCategoria' */}
              <button onClick={() => solicitarOrdenacao("nomeCategoria")} className="flex items-center gap-1">
                CATEGORIA{" "}
                <IconeOrdenacao direcao={configOrdenacao?.key === "nomeCategoria" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold">
              <button onClick={() => solicitarOrdenacao("valor")} className="flex items-center gap-1">
                VALOR <IconeOrdenacao direcao={configOrdenacao?.key === "valor" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold hidden lg:table-cell">
              <button onClick={() => solicitarOrdenacao("estoque")} className="flex items-center gap-1">
                ESTOQUE <IconeOrdenacao direcao={configOrdenacao?.key === "estoque" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold hidden xl:table-cell">
              <button onClick={() => solicitarOrdenacao("dataCadastro")} className="flex items-center gap-1">
                DATA DE CADASTRO{" "}
                <IconeOrdenacao direcao={configOrdenacao?.key === "dataCadastro" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold">AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id} className="border-b hover:bg-gray-100">
              <td className="p-3 font-medium text-gray-900">{produto.nome}</td>
              {/* Exibimos o nomeCategoria que já vem no objeto */}
              <td className="p-3 hidden md:table-cell">{produto.nomeCategoria}</td>
              <td className="p-3">{produto.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
              <td className="p-3 hidden lg:table-cell">{produto.estoque}</td>
              <td className="p-3 hidden xl:table-cell">
                {new Date(produto.dataCadastro).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
              </td>
              <td className="p-3">
                <Link href={`/produtos/${produto.id}/editar`} className="text-blue-600 hover:underline font-medium">
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

export default function PaginaProdutos() {
  const [abaAtiva, setAbaAtiva] = useState<"ativos" | "inativos">("ativos");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      const [dadosProdutos, dadosCategorias] = await Promise.all([buscarProdutos(), buscarCategorias()]);
      setProdutos(dadosProdutos);
      setCategorias(dadosCategorias);
      setCarregando(false);
    }
    carregarDados();
  }, []);

  const mapaCategorias = useMemo(() => new Map(categorias.map((c) => [c.id, c.nome])), [categorias]);

  // Cria a lista de produtos enriquecida com o nome da categoria
  const produtosEnriquecidos = useMemo(
    () =>
      produtos.map((p) => ({
        ...p,
        nomeCategoria: mapaCategorias.get(p.id) || "N/A",
      })),
    [produtos, mapaCategorias]
  );

  const produtosFiltrados = useMemo(
    () =>
      produtosEnriquecidos.filter(
        (p) =>
          p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
          p.nomeCategoria.toLowerCase().includes(filtro.toLowerCase())
      ),
    [produtosEnriquecidos, filtro]
  );

  const produtosAtivos = produtosFiltrados.filter((p) => p.ativo);
  const produtosInativos = produtosFiltrados.filter((p) => !p.ativo);

  const {
    itens: ativosOrdenados,
    solicitarOrdenacao: ordenarAtivos,
    configOrdenacao: configAtivos,
  } = useOrdenacao(produtosAtivos);
  const {
    itens: inativosOrdenados,
    solicitarOrdenacao: ordenarInativos,
    configOrdenacao: configInativos,
  } = useOrdenacao(produtosInativos);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
        <Link
          href="/produtos/novo"
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Adicionar Produto
        </Link>
      </div>

      <div className="relative w-full sm:w-1/3 mb-4">
        <input
          type="text"
          placeholder="Filtrar por nome ou categoria..."
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
            Ativos ({produtosAtivos.length})
          </button>
          <button
            onClick={() => setAbaAtiva("inativos")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              abaAtiva === "inativos"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Inativos ({produtosInativos.length})
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {carregando ? (
          <p className="text-center py-4">Carregando produtos...</p>
        ) : (
          <>
            {abaAtiva === "ativos" &&
              (produtosAtivos.length > 0 ? (
                <TabelaProdutos
                  produtos={ativosOrdenados}
                  solicitarOrdenacao={ordenarAtivos}
                  configOrdenacao={configAtivos}
                />
              ) : (
                <p className="text-sm text-gray-500">Nenhum produto ativo encontrado para este filtro.</p>
              ))}
            {abaAtiva === "inativos" &&
              (produtosInativos.length > 0 ? (
                <TabelaProdutos
                  produtos={inativosOrdenados}
                  solicitarOrdenacao={ordenarInativos}
                  configOrdenacao={configInativos}
                />
              ) : (
                <p className="text-sm text-gray-500">Nenhum produto inativo encontrado para este filtro.</p>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
