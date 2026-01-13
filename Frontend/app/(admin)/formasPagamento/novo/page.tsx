// app/(admin)/formas-pagamento/nova/page.tsx
"use client";

import { useActionState } from "react";
import { FormularioFormaPagamento } from "@/components/admin/FormularioFormaPagamento";
import { adicionarFormaPagamento, EstadoAcao } from "@/lib/acoes";
import { useEffect, useState } from "react";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

export default function PaginaNovaFormaPagamento() {
  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenArmazenado = localStorage.getItem(AUTH_TOKEN_KEY);
    if (tokenArmazenado) {
      setToken(tokenArmazenado);
    }
  }, []);

  const [estado, dispatch] = useActionState(adicionarFormaPagamento, estadoInicial);

  return (
    <form action={dispatch}>
      <input type="hidden" name="token" value={token || ""} />
      <FormularioFormaPagamento erros={estado.erros} />
      {estado.mensagem && <p className="mt-4 text-sm text-red-500">{estado.mensagem}</p>}
    </form>
  );
}
