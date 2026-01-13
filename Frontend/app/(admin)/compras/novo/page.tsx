// app/(admin)/compras/nova/page.tsx
"use client";

import { FormularioCompra } from "@/components/admin/FormularioCompra";
import { Produto, Fornecedor } from "@/lib/definicoes";
import { buscarProdutos, buscarFornecedores } from "@/lib/dados";
import { EstadoAcao, registrarCompra } from "@/lib/acoes";
import { useEffect, useState, useActionState } from "react";
import { useRouter } from "next/navigation"; // O router agora vive aqui
import { toast } from "sonner";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

const Carregando = () => <p className="text-center py-4">Carregando dados...</p>;

export default function PaginaNovaCompra() {
  const [produtosAtivos, setProdutosAtivos] = useState<Produto[]>([]);
  const [fornecedoresAtivos, setFornecedoresAtivos] = useState<Fornecedor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();

  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const [estado, dispatch] = useActionState(registrarCompra, estadoInicial);

  useEffect(() => {
    if (estado?.mensagem) {
      if (estado.mensagem.includes("sucesso")) {
        toast.success(estado.mensagem);
        router.push("/compras");
      } else {
        toast.error(estado.mensagem);
      }
    }
  }, [estado, router]);

  useEffect(() => {
    const tokenArmazenado = localStorage.getItem(AUTH_TOKEN_KEY);
    if (tokenArmazenado) {
      setToken(tokenArmazenado);
    }

    async function carregarDados() {
      const [todosProdutos, todosFornecedores] = await Promise.all([buscarProdutos(), buscarFornecedores()]);
      setProdutosAtivos(todosProdutos.filter((p) => p.ativo));
      setFornecedoresAtivos(todosFornecedores.filter((f) => f.ativo));
      setCarregando(false);
    }
    carregarDados();
  }, []);

  if (carregando) {
    return <Carregando />;
  }

  return (
    <div>
      <FormularioCompra
        produtosAtivos={produtosAtivos}
        fornecedoresAtivos={fornecedoresAtivos}
        token={token}
        estado={estado}
        dispatch={dispatch}
      />
    </div>
  );
}
