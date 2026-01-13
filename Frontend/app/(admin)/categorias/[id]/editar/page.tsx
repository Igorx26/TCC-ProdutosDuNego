"use client";

import { useActionState } from "react";
import { FormularioCategoria } from "@/components/admin/FormularioCategoria";
import { editarCategoria } from "@/lib/acoes";
import { Categoria } from "@/lib/definicoes";
import React, { useEffect, useState, use } from "react";
import { buscarCategoriaPorId } from "@/lib/dados";
import { notFound } from "next/navigation";
import type { EstadoAcao } from "@/lib/acoes";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

const Carregando = () => <p className="text-center py-4">Carregando dados da categoria...</p>;

export default function PaginaEditarCategoria({ params }: { params: Promise<{ id: string }> }) {
  const { id: categoriaId } = use(params);
  const id = Number(categoriaId);

  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function carregarDados() {
      const dadosCategoria = await buscarCategoriaPorId(id);
      const tokenArmazenado = localStorage.getItem(AUTH_TOKEN_KEY);
      if (tokenArmazenado) {
        setToken(tokenArmazenado);
      }
      if (!dadosCategoria) {
        setCarregando(false);
        return;
      }
      setCategoria(dadosCategoria);
      setCarregando(false);
    }
    carregarDados();
  }, [id]);

  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const editarCategoriaComId = editarCategoria.bind(null, id);
  const [estado, dispatch] = useActionState(editarCategoriaComId, estadoInicial);

  if (carregando) return <Carregando />;
  if (!categoria) return notFound();

  return (
    <div>
      <form action={dispatch}>
        {/* Adiciona o token em um campo oculto */}
        <input type="hidden" name="token" value={token || ""} />
        <FormularioCategoria categoria={categoria} erros={estado.erros} />
        {estado.mensagem && <p className="mt-4 text-sm text-red-500">{estado.mensagem}</p>}
      </form>
    </div>
  );
}
