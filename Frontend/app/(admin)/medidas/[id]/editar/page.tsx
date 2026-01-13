// app/(admin)/medidas/[id]/editar/page.tsx
"use client";

import { useActionState } from "react";
import { FormularioMedida } from "@/components/admin/FormularioMedida";
import { editarMedida, EstadoAcao } from "@/lib/acoes";
import { Medida } from "@/lib/definicoes";
import React, { useEffect, useState } from "react";
import { buscarMedidaPorId } from "@/lib/dados";
import { notFound } from "next/navigation";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

const Carregando = () => <p className="text-center py-4">Carregando dados da medida...</p>;

export default function PaginaEditarMedida({ params }: { params: { id: string } }) {
  const id = Number(params.id); // Corrigido
  const [medida, setMedida] = useState<Medida | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenArmazenado = localStorage.getItem(AUTH_TOKEN_KEY);
    if (tokenArmazenado) {
      setToken(tokenArmazenado);
    }

    async function carregarDados() {
      const dadosMedida = await buscarMedidaPorId(id);
      if (!dadosMedida) {
        setCarregando(false);
        return;
      }
      setMedida(dadosMedida);
      setCarregando(false);
    }
    carregarDados();
  }, [id]);

  const editarMedidaComId = editarMedida.bind(null, id);
  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const [estado, dispatch] = useActionState(editarMedidaComId, estadoInicial);

  if (carregando) return <Carregando />;
  if (!medida) return notFound();

  return (
    <form action={dispatch}>
      <input type="hidden" name="token" value={token || ""} />
      <FormularioMedida medida={medida} erros={estado.erros} />
      {estado.mensagem && <p className="mt-4 text-sm text-red-500">{estado.mensagem}</p>}
    </form>
  );
}
