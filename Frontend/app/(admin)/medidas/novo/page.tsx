// app/(admin)/medidas/nova/page.tsx
"use client";

import { useActionState } from "react";
import { adicionarMedida, EstadoAcao } from "@/lib/acoes";
import { FormularioMedida } from "@/components/admin/FormularioMedida";
import { useEffect, useState } from "react";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

export default function PaginaNovaMedida() {
  // Nome corrigido
  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenArmazenado = localStorage.getItem(AUTH_TOKEN_KEY);
    if (tokenArmazenado) {
      setToken(tokenArmazenado);
    }
  }, []);

  const [estado, dispatch] = useActionState(adicionarMedida, estadoInicial);

  return (
    <div>
      <form action={dispatch}>
        <input type="hidden" name="token" value={token || ""} />
        <FormularioMedida erros={estado.erros} />
        {estado.mensagem && <p className="mt-4 text-sm text-red-500">{estado.mensagem}</p>}
      </form>
    </div>
  );
}
