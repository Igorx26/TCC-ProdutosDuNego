// components/vendas/ModalDetalhesVenda.tsx
"use client";

import { Venda } from "@/lib/definicoes";
import React from "react";

interface ModalDetalhesVendaProps {
  venda: Venda;
  onClose: () => void;
}

export function ModalDetalhesVenda({ venda, onClose }: ModalDetalhesVendaProps) {
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const statusTexto = venda.descricaoStatus;
  const idStatus = venda.idStatus;

  let cor: string;

  switch (idStatus) {
    case 1: // Em Aberto
      cor = "bg-gray-100 text-gray-800";
      break;
    case 2: // Separado
      cor = "bg-yellow-100 text-yellow-800";
      break;
    case 3: // Pago, aguardando entrega
      cor = "bg-blue-100 text-blue-800";
      break;
    case 4: // Entregue, aguardando pagamento
      cor = "bg-orange-100 text-orange-800";
      break;
    case 5: // Concluído
      cor = "bg-green-100 text-green-800";
      break;
    case 6: // Cancelado
      cor = "bg-red-100 text-red-800";
      break;
    default:
      cor = "bg-gray-100 text-gray-800";
      break;
  }

  return (
    <div
      className="bg-black/60 w-full h-full fixed top-0 left-0 z-[99] flex items-center justify-center --animation-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[90%] flex flex-col">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold">Detalhes do Pedido #{venda.id}</h2>
          </div>
          <button onClick={onClose} className="text-2xl font-bold hover:text-red-600">
            &times;
          </button>
        </div>

        <div className="overflow-y-auto pr-2 space-y-4">
          {/* Itens da Venda */}
          <h3 className="font-semibold">Itens:</h3>
          <div className="space-y-2">
            {venda.itens?.map((item) => (
              <div key={item.idProduto} className="flex justify-between text-sm p-2 bg-gray-50 rounded-md">
                <span>
                  {item.quantidade}x {item.nomeProduto || "Produto desconhecido"}
                </span>
                <span className="font-medium">
                  {(item.valorUnitario * item.quantidade).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            ))}
          </div>

          {/* Resumo Financeiro */}
          <div className="border-t pt-4 mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{(venda.totalBruto || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            <div className="flex justify-between">
              <span>Desconto:</span>
              <span>- {(venda.desconto || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            {/* --- MUDANÇA 1: Adicionando o Acréscimo --- */}
            <div className="flex justify-between">
              <span>Acréscimo:</span>
              <span>+ {(venda.acrescimo || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            <div className="flex justify-between font-bold text-base mt-2 border-t pt-2">
              <span>Total:</span>
              <span>{(venda.totalLiquido || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
          </div>

          {/* Bloco de Informações Adicionais */}
          <div className="border-t pt-4 mt-4 space-y-2">
            {/* --- MUDANÇA 2: Adicionando a Forma de Pagamento --- */}
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Forma de Pagamento:</span>
              <span className="text-gray-700">{venda.formaPagamento?.descricao || "Não informada"}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Status do Pedido:</span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${cor}`}>{statusTexto}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
