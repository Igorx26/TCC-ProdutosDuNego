// app/(admin)/produtos/novo/page.tsx
"use client";

import { FormularioProduto } from "@/components/admin/FormularioProduto";
import { adicionarProduto, EstadoAcao } from "@/lib/acoes";
import { Categoria, Medida } from "@/lib/definicoes";
import { useEffect, useState, useActionState } from "react";
import { buscarCategorias, buscarMedidas } from "@/lib/dados";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

export default function PaginaNovoProduto() {
  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const [token, setToken] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [medidas, setMedidas] = useState<Medida[]>([]);

  useEffect(() => {
    const tokenArmazenado = localStorage.getItem(AUTH_TOKEN_KEY);
    if (tokenArmazenado) {
      setToken(tokenArmazenado);
    }

    async function carregarDados() {
      const [dadosCategorias, dadosMedidas] = await Promise.all([buscarCategorias(), buscarMedidas()]);
      setCategorias(dadosCategorias);
      setMedidas(dadosMedidas);
    }
    carregarDados();
  }, []);

  const [estado, dispatch] = useActionState(adicionarProduto, estadoInicial);

  return (
    <div>
      <form action={dispatch}>
        <input type="hidden" name="token" value={token || ""} />
        <FormularioProduto categorias={categorias} medidas={medidas} erros={estado.erros} />
        {estado.mensagem && <p className="mt-4 text-sm text-red-500">{estado.mensagem}</p>}
      </form>
    </div>
  );
}
