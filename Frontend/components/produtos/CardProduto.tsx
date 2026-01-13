"use client";

import Image from "next/image";
import { Produto } from "@/lib/definicoes";
import { useCarrinho } from "@/contexts/ContextoCarrinho";

// Ícone do carrinho como um componente para manter o código limpo
const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 256 256">
    <path d="M222.1,65.31a8,8,0,0,0-6.75-3.31H62.59L57.34,32.39A16,16,0,0,0,41.74,20H24a8,8,0,0,0,0,16h17.74l31.54,126.17A16,16,0,0,0,88.88,176H208a16,16,0,0,0,15.74-13.14l12-64A8,8,0,0,0,222.1,65.31ZM92,160l-16-64H210.39l-9.1,48.54Z"></path>
    <circle cx="96" cy="208" r="16"></circle>
    <circle cx="200" cy="208" r="16"></circle>
  </svg>
);

interface CardProdutoProps {
  produto: Produto;
}

export function CardProduto({ produto }: CardProdutoProps) {
  const { adicionarNoCarrinho } = useCarrinho();
  const imageUrl = produto.imagem || "/assets/default.png";

  const handleAdicionarNoCarrinho = () => {
    // Impede a adição se não houver estoque
    if (produto.estoque <= 0) return;
    adicionarNoCarrinho(produto);
  };

  return (
    <div className="flex gap-2 w-full">
      <Image
        src={imageUrl.startsWith("data:") ? imageUrl : `${imageUrl}?v=${new Date().getTime()}`}
        alt={produto.nome}
        width={112}
        height={112}
        className="rounded-md object-cover hover:scale-110 hover:-rotate-2 duration-300 mr-2"
      />
      <div className="w-full pr-4 relative flex flex-col">
        <p className="font-bold">{produto.nome}</p>
        <p className="text-sm pt-2 flex-grow">{produto.descricao}</p>

        {/* --- MUDANÇA 1: Exibição do Estoque --- */}
        <p className="text-gray-500 mt-1">{produto.estoque > 0 ? `Estoque: ${produto.estoque}` : "Esgotado"}</p>

        <div className="flex items-center gap-2 justify-between w-full mt-auto pt-2">
          <p className="font-bold text-lg">
            {produto.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <button
            // --- MUDANÇA 2: Lógica para desabilitar o botão ---
            disabled={produto.estoque === 0}
            className="px-5 py-2 rounded bg-gray-900 hover:bg-red-600 hover:scale-110 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
            onClick={handleAdicionarNoCarrinho}
            aria-label={`Adicionar ${produto.nome} ao carrinho`}
          >
            <CartIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
