// app/(admin)/vendas/nova/page.tsx
"use client";

import { FormularioVenda } from "@/components/admin/FormularioVenda";
import { Produto, FormaPagamento } from "@/lib/definicoes";
import { buscarProdutos, buscarFormasPagamento } from "@/lib/dados";
import { useEffect, useState } from "react";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

const Carregando = () => <p className="text-center py-4">Carregando dados...</p>;

export default function PaginaNovaVenda() {
  const [produtosAtivos, setProdutosAtivos] = useState<Produto[]>([]);
  const [formasPagamentoAtivas, setFormasPagamentoAtivas] = useState<FormaPagamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenArmazenado = localStorage.getItem(AUTH_TOKEN_KEY);
    if (tokenArmazenado) {
      setToken(tokenArmazenado);
    }

    async function carregarDados() {
      const [todosProdutos, todasFormasPagamento] = await Promise.all([buscarProdutos(), buscarFormasPagamento()]);

      setProdutosAtivos(todosProdutos.filter((p) => p.ativo));
      setFormasPagamentoAtivas(todasFormasPagamento.filter((f) => f.ativo));
      setCarregando(false);
    }
    carregarDados();
  }, []);

  if (carregando) {
    return <Carregando />;
  }

  return (
    <div>
      <FormularioVenda produtosAtivos={produtosAtivos} formasPagamentoAtivas={formasPagamentoAtivas} token={token} />
    </div>
  );
}
