"use client";

import Link from "next/link";
import { useEffect, useState, useMemo, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { buscarCompras, buscarProdutos, buscarFornecedores } from "@/lib/dados";
import { CompraItem, Produto, Fornecedor, CompraItemEnriquecido } from "@/lib/definicoes";
import { excluirCompra } from "@/lib/acoes";
import { useOrdenacao } from "@/lib/hooks";
import { Paginacao } from "@/components/admin/Paginacao";
import { CampoDeBusca } from "@/components/admin/CampoDeBusca";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

const IconeOrdenacao = ({ direcao }: { direcao: "asc" | "desc" | null }) => {
  if (!direcao) return <span className="text-gray-400">↕</span>;
  return direcao === "asc" ? <span className="text-blue-500">▲</span> : <span className="text-blue-500">▼</span>;
};

function BotaoExcluirCompra({ idCompraItem, token }: { idCompraItem: number; token: string | null }) {
  const excluirCompraComId = excluirCompra.bind(null, idCompraItem);
  const [estado, dispatch] = useActionState(excluirCompraComId, { mensagem: null });
  const { pending } = useFormStatus();

  useEffect(() => {
    if (estado?.mensagem) {
      if (estado.mensagem.includes("sucesso")) {
        toast.success(estado.mensagem);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(estado.mensagem);
      }
    }
  }, [estado]);

  const handleExcluirClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!window.confirm("Tem certeza que deseja excluir este item da compra? Esta ação não pode ser desfeita.")) {
      event.preventDefault();
    }
  };

  return (
    <form action={dispatch}>
      <input type="hidden" name="token" value={token || ""} />
      <button
        type="submit"
        className="text-red-600 hover:underline font-medium disabled:text-gray-400 disabled:cursor-wait"
        disabled={pending}
        onClick={handleExcluirClick}
      >
        {pending ? "Excluindo..." : "Excluir"}
      </button>
    </form>
  );
}

function TabelaDeCompras({
  compras,
  solicitarOrdenacao,
  configOrdenacao,
  token,
}: {
  compras: CompraItemEnriquecido[];
  solicitarOrdenacao: (key: keyof CompraItemEnriquecido) => void;
  configOrdenacao: { key: keyof CompraItemEnriquecido; direcao: "asc" | "desc" } | null;
  token: string | null;
}) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-3 font-semibold">
              <button onClick={() => solicitarOrdenacao("data")} className="flex items-center gap-1">
                DATA <IconeOrdenacao direcao={configOrdenacao?.key === "data" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold">
              <button onClick={() => solicitarOrdenacao("nomeProduto")} className="flex items-center gap-1">
                PRODUTO{" "}
                <IconeOrdenacao direcao={configOrdenacao?.key === "nomeProduto" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold hidden md:table-cell">
              <button onClick={() => solicitarOrdenacao("nomeVendedor")} className="flex items-center gap-1">
                FORNECEDOR{" "}
                <IconeOrdenacao direcao={configOrdenacao?.key === "nomeVendedor" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold text-right">
              <button
                onClick={() => solicitarOrdenacao("quantidade")}
                className="flex items-center gap-1 justify-end w-full"
              >
                QTD. <IconeOrdenacao direcao={configOrdenacao?.key === "quantidade" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold text-right">
              <button
                onClick={() => solicitarOrdenacao("valor")}
                className="flex items-center gap-1 justify-end w-full"
              >
                VALOR UNIT.{" "}
                <IconeOrdenacao direcao={configOrdenacao?.key === "valor" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold text-right">
              <button
                onClick={() => solicitarOrdenacao("total")}
                className="flex items-center gap-1 justify-end w-full"
              >
                TOTAL <IconeOrdenacao direcao={configOrdenacao?.key === "total" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {compras.map((compra) => (
            <tr key={compra.id} className="border-t hover:bg-gray-50">
              <td className="p-3 whitespace-nowrap">
                {new Date(compra.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
              </td>
              <td className="p-3 font-medium text-gray-900">{compra.nomeProduto}</td>
              <td className="p-3 hidden md:table-cell">{compra.nomeVendedor}</td>
              <td className="p-3 text-right">{compra.quantidade}</td>
              <td className="p-3 text-right">
                {compra.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </td>
              <td className="p-3 font-bold text-right">
                {compra.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </td>
              <td className="p-3 text-center">
                <BotaoExcluirCompra idCompraItem={compra.id} token={token} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PaginaCompras() {
  const searchParams = useSearchParams();
  const busca = searchParams.get("busca") || "";
  const paginaAtual = Number(searchParams.get("page")) || 1;
  const [compras, setCompras] = useState<CompraItem[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenArmazenado = localStorage.getItem(AUTH_TOKEN_KEY);
    setToken(tokenArmazenado);

    async function carregarDados() {
      const [dadosCompras, dadosProdutos, dadosFornecedores] = await Promise.all([
        buscarCompras(),
        buscarProdutos(),
        buscarFornecedores(),
      ]);
      setCompras(dadosCompras);
      setProdutos(dadosProdutos);
      setFornecedores(dadosFornecedores);
      setCarregando(false);
    }
    carregarDados();
  }, []);

  const mapaProdutos = useMemo(() => new Map(produtos.map((p) => [p.id, p.nome])), [produtos]);
  const mapaFornecedores = useMemo(() => new Map(fornecedores.map((f) => [f.id, f.nomeVendedor])), [fornecedores]);

  const comprasEnriquecidas = useMemo(
    () =>
      compras.map((c) => ({
        ...c,
        nomeProduto: mapaProdutos.get(c.idProduto) || "Produto não encontrado",
        nomeVendedor: mapaFornecedores.get(c.idFornecedor) || "Fornecedor não encontrado",
      })),
    [compras, mapaProdutos, mapaFornecedores]
  );

  const comprasFiltradas = useMemo(
    () =>
      comprasEnriquecidas.filter(
        (c) =>
          c.nomeProduto.toLowerCase().includes(busca.toLowerCase()) ||
          c.nomeVendedor.toLowerCase().includes(busca.toLowerCase())
      ),
    [comprasEnriquecidas, busca]
  );

  const { itens: comprasOrdenadas, solicitarOrdenacao, configOrdenacao } = useOrdenacao(comprasFiltradas);

  const itensPorPagina = 10;
  const totalPaginas = Math.ceil(comprasOrdenadas.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const itensDaPagina = comprasOrdenadas.slice(inicio, fim);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">Histórico de Compras</h1>
        <Link
          href="/compras/novo"
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Registrar Compra
        </Link>
      </div>

      <CampoDeBusca placeholder="Buscar por produto ou fornecedor..." />

      <div className="mt-6">
        {carregando ? (
          <p className="text-center py-4">Carregando histórico de compras...</p>
        ) : (
          <>
            <TabelaDeCompras
              compras={itensDaPagina}
              solicitarOrdenacao={solicitarOrdenacao}
              configOrdenacao={configOrdenacao}
              token={token}
            />
            <Paginacao totalPaginas={totalPaginas} />
          </>
        )}
      </div>
    </div>
  );
}
