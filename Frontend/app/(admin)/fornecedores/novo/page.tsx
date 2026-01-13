"use client";

import { useActionState } from "react";
import { FormularioFornecedor } from "@/components/admin/FormularioFornecedor";
import { adicionarFornecedor, EstadoAcao } from "@/lib/acoes";
import { useEffect, useState } from "react";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

function limparDados(formData: FormData) {
  const celularVendedor = formData.get("celularVendedor") as string;
  if (celularVendedor) {
    formData.set("celularVendedor", celularVendedor.replace(/\D/g, ""));
  }

  const telefoneEmpresa = formData.get("telefoneEmpresa") as string;
  if (telefoneEmpresa) {
    formData.set("telefoneEmpresa", telefoneEmpresa.replace(/\D/g, ""));
  }

  const cnpj = formData.get("cnpj") as string;
  if (cnpj) {
    formData.set("cnpj", cnpj.replace(/\D/g, ""));
  }

  return formData;
}

export default function PaginaNovoFornecedor() {
  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenArmazenado = localStorage.getItem(AUTH_TOKEN_KEY);
    if (tokenArmazenado) {
      setToken(tokenArmazenado);
    }
  }, []);

  const [estado, dispatch] = useActionState(adicionarFornecedor, estadoInicial);

  const handleSubmit = (formData: FormData) => {
    const dadosLimpos = limparDados(formData);
    dispatch(dadosLimpos);
  };

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="token" value={token || ""} />
      <FormularioFornecedor erros={estado.erros} />
      {estado.mensagem && <p className="mt-4 text-sm text-red-500">{estado.mensagem}</p>}
    </form>
  );
}
