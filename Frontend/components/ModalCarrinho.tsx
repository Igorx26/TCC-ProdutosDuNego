// ModalCarrinho.tsx
"use client";

import { useCarrinho } from "@/contexts/ContextoCarrinho";
import { useAuth } from "@/contexts/ContextoAuth"; // 1. Importar o hook de autenticação
import { useRouter } from "next/navigation"; // 2. Importar o router para navegar
import React from "react";
import { toast } from "sonner";

interface ModalCarrinhoProps {
  onClose: () => void;
}

export function ModalCarrinho({ onClose }: ModalCarrinhoProps) {
  const { carrinho, removerDoCarrinho, totalCarrinho, limparCarrinho } = useCarrinho();
  const { usuario } = useAuth(); // 3. Obter o estado do usuário
  const router = useRouter();

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleLimparCarrinho = () => {
    if (window.confirm("Tem certeza que deseja esvaziar seu carrinho?")) {
      limparCarrinho();
    }
  };

  const handleIrParaCheckout = () => {
    if (!usuario) {
      toast.info("Por favor, faça login para continuar a compra.");
      router.push("/login"); // Se não houver usuário, redireciona para o login
    } else {
      router.push("/checkout"); // Se houver usuário, vai para o checkout
    }
    onClose(); // Fecha o modal em ambos os casos
  };

  return (
    <div
      className="bg-black/60 w-full h-full fixed top-0 left-0 z-[99] flex items-center justify-center animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#f0f3fd] p-5 rounded-md min-w-[90%] md:min-w-[600px] max-h-[90%] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-center font-bold text-2xl">Meu carrinho</h2>
          {carrinho.length > 0 && (
            <button onClick={handleLimparCarrinho} className="text-red-600 text-sm font-medium hover:underline">
              Limpar carrinho
            </button>
          )}
        </div>

        <div id="carrinho-items" className="flex flex-col justify-between mb-2">
          {carrinho.length > 0 ? (
            carrinho.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-2 mb-2">
                <div>
                  <p className="font-bold">{item.nome}</p>
                  <p>Quantidade: {item.quantidade}</p>
                  <p className="font-medium my-2">
                    {item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
                <button
                  className="text-red-600 text-sm font-medium hover:underline"
                  onClick={() => removerDoCarrinho(item.id)}
                >
                  Remover
                </button>
              </div>
            ))
          ) : (
            <div className="text-center my-8 flex flex-col items-center gap-4">
              <p className="text-lg font-medium">Seu carrinho está vazio.</p>
              <p className="text-gray-600">Adicione produtos para vê-los aqui!</p>
              <button
                onClick={onClose}
                className="mt-2 bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors"
              >
                Continuar Comprando
              </button>
            </div>
          )}
        </div>

        {carrinho.length > 0 && (
          <p className="font-bold">
            Total: <span>{totalCarrinho.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </p>
        )}

        <div className="flex items-center justify-between mt-5 w-full">
          <button onClick={onClose} className="py-1 px-3 rounded hover:bg-gray-200">
            Fechar
          </button>

          {carrinho.length > 0 ? (
            <button
              onClick={handleIrParaCheckout}
              className="bg-green-500 text-white text-center px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Ir para Checkout
            </button>
          ) : (
            <button disabled className="bg-gray-400 text-white text-center px-4 py-2 rounded cursor-not-allowed">
              Ir para Checkout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
