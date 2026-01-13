// components/admin/ModalDetalhesVenda.tsx
"use client";

import { Venda } from "@/lib/definicoes";
import { getStatusVenda } from "@/lib/uteis";
import { marcarVendaComoPaga, marcarVendaComoEntregue, cancelarVendaAdmin } from "@/lib/acoes";
import React, { useState, useTransition } from "react";
import { toast } from "sonner";

interface ModalDetalhesVendaProps {
  venda: Venda;
  onClose: () => void;
}

export function ModalDetalhesVenda({ venda, onClose }: ModalDetalhesVendaProps) {
  const [acaoAtiva, setAcaoAtiva] = useState<"pagar" | "entregar" | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [isPending, startTransition] = useTransition();
  const status = getStatusVenda(venda);

  const handleAcao = (acao: () => Promise<any>) => {
    startTransition(async () => {
      const resultado = await acao();
      if (resultado?.mensagem) {
        toast.success(resultado.mensagem);
      }
      onClose();
    });
  };

  const handleConfirmarAcao = () => {
    if (!dataSelecionada) {
      toast.error("Por favor, selecione uma data e hora.");
      return;
    }
    if (acaoAtiva === "pagar") {
      handleAcao(() => marcarVendaComoPaga(venda.id, dataSelecionada));
    } else if (acaoAtiva === "entregar") {
      handleAcao(() => marcarVendaComoEntregue(venda.id, dataSelecionada));
    }
  };

  return (
    <div
      className="bg-black/60 w-full h-full fixed top-0 left-0 z-[99] flex items-center justify-center animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90%] flex flex-col">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold">Detalhes da Venda #{venda.id}</h2>
          <button onClick={onClose} className="text-3xl font-bold hover:text-red-600">
            &times;
          </button>
        </div>

        <div className="overflow-y-auto pr-2 space-y-4">
          {/* Detalhes do Cliente e Status */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <strong>Cliente:</strong>
              <span>{venda.nomeCliente}</span>
            </div>
            <div className="flex justify-between items-center">
              <strong>Celular:</strong>
              <span>{mascaraCelular(venda.cliente!.celular)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${status.cor}`}>{status.texto}</span>
            </div>
          </div>

          {/* Itens da Venda */}
          <h3 className="font-semibold">Itens do Pedido:</h3>
          <div className="space-y-2 border-b pb-4">
            {venda.itens?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm p-2 bg-gray-100 rounded-md">
                <span>
                  {item.quantidade}x {item.produto?.nome}
                </span>
                <span className="font-medium">
                  {(item.valor * item.quantidade).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            ))}
          </div>

          {/* Resumo Financeiro */}
          <div className="pt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>{" "}
              <span>{(venda.totalBruto || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            <div className="flex justify-between">
              <span>Acréscimo:</span>{" "}
              <span>+ {(venda.acrescimo || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            <div className="flex justify-between">
              <span>Desconto:</span>{" "}
              <span>- {(venda.desconto || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            <div className="flex justify-between font-bold text-base mt-2 border-t pt-2">
              <span>Total:</span>{" "}
              <span>{(venda.totalLiquido || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
          </div>

          {/* Detalhes de Entrega e Pagamento */}
          <div className="border-t pt-4 mt-4 space-y-2">
            <div className="text-sm">
              <p className="font-semibold">Tipo de Pedido:</p>
              <p>{venda.entrega ? "Entrega" : "Retirada no local"}</p>
            </div>
            {venda.entrega && venda.endereco && (
              <div className="text-sm">
                <p className="font-semibold">Endereço de Entrega:</p>
                <p>{`${venda.endereco.logradouro}, ${venda.endereco.numero} - ${venda.endereco.bairro}, ${venda.endereco.cidade} - ${venda.endereco.uf}`}</p>
              </div>
            )}
            <div className="text-sm">
              <p className="font-semibold">Forma de Pagamento:</p>
              <p>{venda.formaPagamento?.descricao || "Não informada"}</p>
            </div>
          </div>

          {/* Ações do Administrador */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-2">Ações do Administrador</h3>
            <div className="flex flex-wrap gap-4 items-start">
              {/* --- AÇÃO DE PAGAMENTO --- */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setAcaoAtiva("pagar");
                    setDataSelecionada(new Date().toISOString().slice(0, 16));
                  }}
                  disabled={!!venda.dataHoraPagamento || acaoAtiva === "pagar" || isPending}
                  className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isPending && acaoAtiva === "pagar" ? "Salvando..." : "Marcar como Paga"}
                </button>
                {acaoAtiva === "pagar" && (
                  <div className="flex items-center gap-2 animate-fadeIn">
                    <input
                      type="datetime-local"
                      value={dataSelecionada}
                      onChange={(e) => setDataSelecionada(e.target.value)}
                      className="p-1 border rounded-md text-sm"
                    />
                    <button onClick={handleConfirmarAcao} className="bg-blue-700 text-white px-3 py-1 text-sm rounded">
                      OK
                    </button>
                  </div>
                )}
              </div>

              {/* --- AÇÃO DE ENTREGA --- */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setAcaoAtiva("entregar");
                    setDataSelecionada(new Date().toISOString().slice(0, 16));
                  }}
                  disabled={!!venda.dataHoraDaEntrega || acaoAtiva === "entregar" || isPending}
                  className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isPending && acaoAtiva === "entregar" ? "Salvando..." : "Marcar como Entregue"}
                </button>
                {acaoAtiva === "entregar" && (
                  <div className="flex items-center gap-2 animate-fadeIn">
                    <input
                      type="datetime-local"
                      value={dataSelecionada}
                      onChange={(e) => setDataSelecionada(e.target.value)}
                      className="p-1 border rounded-md text-sm"
                    />
                    <button onClick={handleConfirmarAcao} className="bg-blue-700 text-white px-3 py-1 text-sm rounded">
                      OK
                    </button>
                  </div>
                )}
              </div>

              {/* --- AÇÃO DE CANCELAMENTO --- */}
              <button
                type="button"
                onClick={() => handleAcao(() => cancelarVendaAdmin(venda.id))}
                disabled={status.texto === "Concluído" || status.texto === "Cancelado" || isPending}
                className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isPending ? "Cancelando..." : "Cancelar Venda"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
