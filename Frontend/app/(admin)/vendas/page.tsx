"use client";

import { useEffect, useState, useMemo } from "react";
import { buscarVendas, buscarStatus } from "@/lib/dados";
import { Venda, Status } from "@/lib/definicoes";
import { useOrdenacao } from "@/lib/hooks";
import { getStatusVenda } from "@/lib/uteis";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiEye } from "react-icons/fi";
import { ModalDetalhesVenda } from "@/components/admin/ModalDetalhesVendaAdmin";
import { CampoDeBusca } from "@/components/admin/CampoDeBusca";
import { Paginacao } from "@/components/admin/Paginacao";

const IconeOrdenacao = ({ direcao }: { direcao: "asc" | "desc" | null }) => {
  if (!direcao) return <span className="text-gray-400">↕</span>;
  return direcao === "asc" ? <span className="text-blue-500">▲</span> : <span className="text-blue-500">▼</span>;
};

function TabelaVendas({
  vendas,
  abrirModal,
  solicitarOrdenacao,
  configOrdenacao,
}: {
  vendas: Venda[];
  abrirModal: (venda: Venda) => void;
  solicitarOrdenacao: (key: keyof Venda) => void;
  configOrdenacao: { key: keyof Venda; direcao: "asc" | "desc" } | null;
}) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
          {/* O cabeçalho da sua tabela permanece o mesmo */}
        </thead>
        <tbody>
          {vendas.map((venda) => {
            const status = getStatusVenda(venda);
            return (
              <tr key={venda.id} className="border-t hover:bg-gray-50">
                <td className="p-3 whitespace-nowrap hidden sm:table-cell">
                  {new Date(venda.dataHora!).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                </td>
                <td className="p-3 font-medium text-gray-900 truncate">{venda.nomeCliente}</td>
                <td className="p-3 text-right font-bold hidden md:table-cell">
                  {venda.totalLiquido?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="p-3 text-center hidden lg:table-cell">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.cor}`}>
                    {venda.descricaoStatus}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => abrirModal(venda)} className="text-blue-600 hover:text-blue-800">
                    <FiEye size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ListaCardsVendas({ vendas, abrirModal }: { vendas: Venda[]; abrirModal: (venda: Venda) => void }) {
  return (
    <div className="space-y-3">
      {vendas.map((venda) => {
        const status = getStatusVenda(venda);
        return (
          <div
            key={venda.id}
            onClick={() => abrirModal(venda)}
            className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-800 truncate">{venda.nomeCliente}</p>
                <p className="text-xs text-gray-500">
                  Pedido #{venda.id} - {new Date(venda.dataHora!).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${status.cor}`}>
                {status.texto}
              </span>
            </div>
            <div className="flex justify-between items-end mt-4">
              <p className="text-lg font-bold text-gray-900">
                {venda.totalLiquido?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <button className="text-blue-600 text-sm font-medium">Ver Detalhes</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PaginaVendas() {
  const searchParams = useSearchParams();
  const busca = searchParams.get("busca") || "";
  const paginaAtual = Number(searchParams.get("page")) || 1;

  // Estados do componente
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [status, setStatus] = useState<Status[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<number>(0);
  const [carregando, setCarregando] = useState(true);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);

  // Busca de dados principal: agora muito mais simples!
  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);
      const [dadosVendas, dadosStatus] = await Promise.all([
        buscarVendas(), // Esta função já retorna Venda[]
        buscarStatus(),
      ]);

      setVendas(dadosVendas); // Os dados já vêm enriquecidos
      setStatus([{ id: 0, descricao: "Todas", ativo: true }, ...dadosStatus]);
      setCarregando(false);
    }
    carregarDados();
  }, []);

  // A lógica de filtragem, ordenação e paginação agora funciona com os dados já enriquecidos
  const vendasFiltradas = useMemo(() => {
    return vendas.filter(
      (v) => (v.nomeCliente?.toLowerCase() || "").includes(busca.toLowerCase()) || v.id.toString().includes(busca)
    );
  }, [vendas, busca]);

  const vendasPorAba = useMemo(() => {
    if (abaAtiva === 0) return vendasFiltradas;
    return vendasFiltradas.filter((v) => v.idStatus === abaAtiva);
  }, [vendasFiltradas, abaAtiva]);

  const { itens: vendasOrdenadas, solicitarOrdenacao, configOrdenacao } = useOrdenacao(vendasPorAba);

  const itensPorPagina = 10;
  const totalPaginas = Math.ceil(vendasOrdenadas.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const itensDaPagina = vendasOrdenadas.slice(inicio, fim);

  const handleAbrirModal = (venda: Venda) => {
    setVendaSelecionada(venda);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">Gerenciar Vendas</h1>
        <Link
          href="/vendas/novo"
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Adicionar Venda
        </Link>
      </div>
      <CampoDeBusca placeholder="Filtrar por cliente ou ID da venda..." />

      <div className="border-b border-gray-200">
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Tabs">
          {status.map((s) => (
            <button
              key={s.id}
              onClick={() => setAbaAtiva(s.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                abaAtiva === s.id
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {s.descricao} (
              {s.id === 0 ? vendasFiltradas.length : vendasFiltradas.filter((v) => v.idStatus === s.id).length})
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {carregando ? (
          <p className="text-center py-4">Carregando vendas...</p>
        ) : (
          <>
            <div className="hidden sm:block">
              <TabelaVendas
                vendas={itensDaPagina}
                abrirModal={handleAbrirModal}
                solicitarOrdenacao={solicitarOrdenacao}
                configOrdenacao={configOrdenacao}
              />
            </div>
            <div className="block sm:hidden">
              <ListaCardsVendas vendas={itensDaPagina} abrirModal={handleAbrirModal} />
            </div>
            <Paginacao totalPaginas={totalPaginas} />
          </>
        )}
      </div>

      {vendaSelecionada && <ModalDetalhesVenda venda={vendaSelecionada} onClose={() => setVendaSelecionada(null)} />}
    </div>
  );
}
