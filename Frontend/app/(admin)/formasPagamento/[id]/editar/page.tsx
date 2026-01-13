// app/(admin)/formas-pagamento/[id]/editar/page.tsx
"use client";

import { useActionState } from "react";
import { FormularioFormaPagamento } from "@/components/admin/FormularioFormaPagamento";
import { editarFormaPagamento, EstadoAcao } from "@/lib/acoes";
import { FormaPagamento } from "@/lib/definicoes";
import React, { useEffect, useState } from "react";
import { buscarFormaPagamentoPorId } from "@/lib/dados";
import { notFound } from "next/navigation";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

const Carregando = () => <p className="text-center py-4">Carregando dados...</p>;

export default function PaginaEditarFormaPagamento({ params }: { params: { id: string } }) {
  const id = Number(params.id); // Corrigido: Acesso direto ao 'id'
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Carrega o token
    const tokenArmazenado = localStorage.getItem(AUTH_TOKEN_KEY);
    if (tokenArmazenado) {
      setToken(tokenArmazenado);
    }

    async function carregarDados() {
      const dados = await buscarFormaPagamentoPorId(id);
      if (!dados) {
        setCarregando(false);
        return;
      }
      setFormaPagamento(dados);
      setCarregando(false);
    }
    carregarDados();
  }, [id]);

  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const editarComId = editarFormaPagamento.bind(null, id);
  const [estado, dispatch] = useActionState(editarComId, estadoInicial);

  if (carregando) return <Carregando />;
  if (!formaPagamento) return notFound();

  return (
    <form action={dispatch}>
      <input type="hidden" name="token" value={token || ""} />
      <FormularioFormaPagamento formaPagamento={formaPagamento} erros={estado.erros} />
      {estado.mensagem && <p className="mt-4 text-sm text-red-500">{estado.mensagem}</p>}
    </form>
  );
}
