// app/(admin)/produtos/[id]/editar/page.tsx
"use client";

import { FormularioProduto } from "@/components/admin/FormularioProduto";
import { editarProduto, EstadoAcao } from "@/lib/acoes";
import { Produto, Categoria, Medida } from "@/lib/definicoes";
import React, { useEffect, useState, useActionState } from "react";
import { buscarCategorias, buscarMedidas, buscarProdutoPorId } from "@/lib/dados";
import { notFound } from "next/navigation";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

const Carregando = () => <p className="text-center py-4">Carregando dados do produto...</p>;

export default function PaginaEditarProduto({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [produto, setProduto] = useState<Produto | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenArmazenado = localStorage.getItem(AUTH_TOKEN_KEY);
    if (tokenArmazenado) {
      setToken(tokenArmazenado);
    }

    async function carregarDados() {
      const [dadosProduto, dadosCategorias, dadosMedidas] = await Promise.all([
        buscarProdutoPorId(id),
        buscarCategorias(),
        buscarMedidas(),
      ]);

      if (!dadosProduto) {
        setCarregando(false);
        return;
      }
      setProduto(dadosProduto);
      setCategorias(dadosCategorias);
      setMedidas(dadosMedidas);
      setCarregando(false);
    }
    carregarDados();
  }, [id]);

  const editarProdutoComId = editarProduto.bind(null, id);
  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const [estado, dispatch] = useActionState(editarProdutoComId, estadoInicial);

  if (carregando) return <Carregando />;
  if (!produto) return notFound();

  return (
    <div>
      <form action={dispatch}>
        <input type="hidden" name="token" value={token || ""} />
        <FormularioProduto produto={produto} categorias={categorias} medidas={medidas} erros={estado.erros} />
        {estado.mensagem && <p className="mt-4 text-sm text-red-500">{estado.mensagem}</p>}
      </form>
    </div>
  );
}
