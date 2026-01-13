"use client";

import { useState, useMemo } from "react";

// O tipo genérico 'T' permite que este hook funcione com qualquer tipo de objeto (Produtos, Vendas, etc.)
export function useOrdenacao<T>(items: T[], configInicial = null) {
  const [configOrdenacao, setConfigOrdenacao] = useState<{ key: keyof T; direcao: "asc" | "desc" } | null>(
    configInicial
  );

  const itensOrdenados = useMemo(() => {
    if (!configOrdenacao) {
      return items;
    }

    // Cria uma cópia mutável do array para não alterar o original
    const itensSensiveisAOrdenacao = [...items];

    itensSensiveisAOrdenacao.sort((a, b) => {
      if (a[configOrdenacao.key] < b[configOrdenacao.key]) {
        return configOrdenacao.direcao === "asc" ? -1 : 1;
      }
      if (a[configOrdenacao.key] > b[configOrdenacao.key]) {
        return configOrdenacao.direcao === "asc" ? 1 : -1;
      }
      return 0;
    });

    return itensSensiveisAOrdenacao;
  }, [items, configOrdenacao]);

  const solicitarOrdenacao = (key: keyof T) => {
    let direcao: "asc" | "desc" = "asc";
    if (configOrdenacao && configOrdenacao.key === key && configOrdenacao.direcao === "asc") {
      direcao = "desc";
    }
    setConfigOrdenacao({ key, direcao });
  };

  return { itens: itensOrdenados, solicitarOrdenacao, configOrdenacao };
}
