"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { FormularioCategoria } from "@/components/admin/FormularioCategoria";
import { adicionarCategoria, EstadoAcao } from "@/lib/acoes";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

export default function PaginaNovaCategoria() {
  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const tokenArmazenado = localStorage.getItem(AUTH_TOKEN_KEY);
    if (tokenArmazenado) {
      setToken(tokenArmazenado);
    }
  }, []);

  const [estado, dispatch] = useActionState(adicionarCategoria, estadoInicial);

  return (
    <div>
      <form action={dispatch}>
        <input type="hidden" name="token" value={token || ""} />
        <FormularioCategoria erros={estado.erros} />
        {estado.mensagem && <p className="mt-4 text-sm text-red-500">{estado.mensagem}</p>}
      </form>
    </div>
  );
}
