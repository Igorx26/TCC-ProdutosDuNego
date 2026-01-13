// app/(admin)/fornecedores/[id]/editar/page.tsx
"use client";

import { useActionState } from "react";
import { FormularioFornecedor } from "@/components/admin/FormularioFornecedor";
import { editarFornecedor, EstadoAcao } from "@/lib/acoes";
import { Fornecedor } from "@/lib/definicoes";
import React, { useEffect, useState } from "react";
import { buscarFornecedorPorId } from "@/lib/dados";
import { notFound } from "next/navigation";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

const Carregando = () => <p className="text-center py-4">Carregando dados do fornecedor...</p>;

export default function PaginaEditarFornecedor({ params }: { params: { id: string } }) {
  const id = Number(params.id); // Corrigido
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenArmazenado = localStorage.getItem(AUTH_TOKEN_KEY);
    if (tokenArmazenado) {
      setToken(tokenArmazenado);
    }

    async function carregarDados() {
      const dados = await buscarFornecedorPorId(id);
      if (!dados) {
        setCarregando(false);
        return;
      }
      setFornecedor(dados);
      setCarregando(false);
    }
    carregarDados();
  }, [id]);

  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const editarComId = editarFornecedor.bind(null, id);
  const [estado, dispatch] = useActionState(editarComId, estadoInicial);

  if (carregando) return <Carregando />;
  if (!fornecedor) return notFound();

  return (
    <form action={dispatch}>
      <input type="hidden" name="token" value={token || ""} />
      <FormularioFornecedor fornecedor={fornecedor} erros={estado.erros} />
      {estado.mensagem && <p className="mt-4 text-sm text-red-500">{estado.mensagem}</p>}
    </form>
  );
}
