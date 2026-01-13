"use client";

import { useState } from "react";
import { Venda } from "@/lib/definicoes";
import { cancelarVenda } from "@/lib/acoes";
import { ModalDetalhesVenda } from "./ModalDetalhesVenda";
import { buscarVendaCompletaPorId } from "@/lib/dados";
import { getStatusVenda } from "@/lib/uteis";

const formatarData = (dateString: string | null | undefined) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
};

export function CardVenda({ venda }: { venda: Venda }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [dadosVendaDetalhada, setDadosVendaDetalhada] = useState<Venda | null>(null);
  const [carregando, setCarregando] = useState(false);

  const { cor: statusCor, podeCancelar } = getStatusVenda(venda);

  const handleCancelar = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (window.confirm("Tem certeza que deseja cancelar este pedido?")) {
      const token = localStorage.getItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token");
      await cancelarVenda(venda.id, token);
    }
  };

  const handleAbrirModal = async () => {
    if (carregando) return;
    setCarregando(true);
    const vendaCompleta = await buscarVendaCompletaPorId(venda.id);
    setDadosVendaDetalhada(vendaCompleta as Venda | null);
    setCarregando(false);
    setModalAberto(true);
  };

  return (
    <>
      <div
        className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={handleAbrirModal}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="min-w-0">
            <h3 className="font-bold text-lg">Pedido #{venda.id}</h3>
            <p className="text-sm text-gray-500">Realizado em: {formatarData(venda.dataHora)}</p>
            <p className="font-bold text-lg mt-2">
              {(venda.totalLiquido || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>
          <div className="flex flex-row-reverse sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-10">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusCor}`}>
              {venda.descricaoStatus}
            </span>
            {podeCancelar && (
              <button
                disabled={carregando}
                onClick={handleCancelar}
                className="text-red-600 text-sm font-medium hover:underline z-10 relative"
              >
                {carregando ? "Aguarde..." : "Cancelar Pedido"}
              </button>
            )}
          </div>
        </div>
      </div>
      {modalAberto && dadosVendaDetalhada && (
        <ModalDetalhesVenda venda={dadosVendaDetalhada} onClose={() => setModalAberto(false)} />
      )}
    </>
  );
}
