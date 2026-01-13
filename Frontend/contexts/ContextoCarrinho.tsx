"use client";

import { toast } from "sonner";
import { createContext, useState, useContext, ReactNode, useMemo, useEffect, useCallback } from "react";
import { ItemCarrinho, Produto } from "@/lib/definicoes";

// A chave usafa para salvar e ler do localStorage
const CARRINHO_STORAGE_KEY = "produtosDuNego:carrinho";
const HORAS_PARA_EXPIRAR = 4; // O carrinho expira após 4 horas de inatividade

interface CarrinhoContextType {
  carrinho: ItemCarrinho[];
  adicionarNoCarrinho: (produto: Produto) => void;
  removerDoCarrinho: (id: number) => void;
  limparCarrinho: () => void;
  totalItens: number;
  totalCarrinho: number;
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined);

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

  useEffect(() => {
    try {
      const carrinhoArmazenadoString = localStorage.getItem(CARRINHO_STORAGE_KEY);
      if (carrinhoArmazenadoString) {
        const carrinhoArmazenado = JSON.parse(carrinhoArmazenadoString);

        const tempoAgora = Date.now();
        const tempoDecorridoEmMs = tempoAgora - carrinhoArmazenado.timestamp;
        const horasDecorrido = tempoDecorridoEmMs / (60 * 60 * 1000);

        // Se o tempo decorrido for menor que o limite, carrega o carrinho
        if (horasDecorrido < HORAS_PARA_EXPIRAR) {
          setCarrinho(carrinhoArmazenado.itens);
        } else {
          // Se expirou, remove o item do localStorage
          localStorage.removeItem(CARRINHO_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Falha ao carregar o carrinho do localStorage:", error);
      localStorage.removeItem(CARRINHO_STORAGE_KEY);
    }
  }, []); // Roda apenas uma vez, na montagem inicial

  useEffect(() => {
    // Não salva um carrinho vazio no início se ele já não existia
    if (carrinho.length > 0 || localStorage.getItem(CARRINHO_STORAGE_KEY)) {
      const dadosParaArmazenar = {
        timestamp: Date.now(),
        itens: carrinho,
      };
      localStorage.setItem(CARRINHO_STORAGE_KEY, JSON.stringify(dadosParaArmazenar));
    }
  }, [carrinho]); // Roda sempre que o carrinho mudar

  const adicionarNoCarrinho = useCallback((produto: Produto) => {
    setCarrinho((carrinhoAnterior) => {
      const itemExistente = carrinhoAnterior.find((item) => item.id === produto.id);
      if (itemExistente) {
        return carrinhoAnterior.map((item) =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...carrinhoAnterior, { ...produto, quantidade: 1 }];
    });
    toast.success(`${produto.nome} foi adicionado ao carrinho!`);
  }, []); // O array de dependências vazio [] garante que a função nunca seja recriada

  const removerDoCarrinho = useCallback((id: number) => {
    let nomeItemRemovido = "";
    setCarrinho((carrinhoAnterior) => {
      const itemParaRemover = carrinhoAnterior.find((item) => item.id === id);
      if (!itemParaRemover) return carrinhoAnterior;
      nomeItemRemovido = itemParaRemover.nome;
      if (itemParaRemover.quantidade > 1) {
        return carrinhoAnterior.map((item) => (item.id === id ? { ...item, quantidade: item.quantidade - 1 } : item));
      }
      return carrinhoAnterior.filter((item) => item.id !== id);
    });
    if (nomeItemRemovido) {
      toast.error(`${nomeItemRemovido} foi removido do carrinho.`);
    }
  }, []); // Também estabilizada

  const limparCarrinho = useCallback(() => {
    setCarrinho([]);
    // O toast aqui é redundante, pois a página de checkout já exibe
    // um toast de sucesso. Pode ser removido para evitar duplicidade.
    // toast.info("Seu carrinho foi esvaziado.");
  }, []); // ESSA É A CORREÇÃO PRINCIPAL! A função agora é estável.

  // Seus useMemo para os totais já estão corretos.
  const totalItens = useMemo(() => {
    return carrinho.reduce((count, item) => count + item.quantidade, 0);
  }, [carrinho]);

  const totalCarrinho = useMemo(() => {
    return carrinho.reduce((total, item) => total + item.valor * item.quantidade, 0);
  }, [carrinho]);

  // --- MUDANÇA 2 (BOA PRÁTICA): MEMOIZE O OBJETO DE VALOR ---
  const value = useMemo(
    () => ({
      carrinho,
      adicionarNoCarrinho,
      removerDoCarrinho,
      limparCarrinho,
      totalItens,
      totalCarrinho,
    }),
    [carrinho, totalItens, totalCarrinho, adicionarNoCarrinho, removerDoCarrinho, limparCarrinho]
  );

  return <CarrinhoContext.Provider value={value}>{children}</CarrinhoContext.Provider>;
}

export function useCarrinho() {
  const context = useContext(CarrinhoContext);
  if (context === undefined) {
    throw new Error("useCarrinho deve ser usado dentro de um CarrinhoProvider");
  }
  return context;
}
