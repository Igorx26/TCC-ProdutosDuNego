"use client";

import { CardVenda } from "@/components/vendas/CardVenda";
import { useAuth } from "@/contexts/ContextoAuth";
import { buscarMeusPedidos } from "@/lib/dados";
import { Venda } from "@/lib/definicoes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CarregandoSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
  </div>
);

export default function MeusPedidosPagina() {
  const { usuario, carregando: carregandoAuth } = useAuth();
  const router = useRouter();

  const [vendas, setVendas] = useState<Venda[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);

  useEffect(() => {
    if (!carregandoAuth) {
      if (!usuario) {
        router.push("/login");
        return;
      }

      async function carregarVendas() {
        setCarregandoDados(true);
        const dadosVendas = await buscarMeusPedidos();
        setVendas(dadosVendas);
        setCarregandoDados(false);
      }

      carregarVendas();
    }
  }, [usuario, carregandoAuth, router]);

  const vendasEmAndamento = vendas.filter(
    (venda) => venda.descricaoStatus !== "Concluído" && venda.descricaoStatus !== "Cancelado"
  );
  const vendasConcluidas = vendas.filter(
    (venda) => venda.descricaoStatus === "Concluído" || venda.descricaoStatus === "Cancelado"
  );

  if (carregandoAuth || carregandoDados) {
    return <CarregandoSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#f0f3fd] pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Pedidos</h1>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2">Pedidos em Andamento</h2>
          {vendasEmAndamento.length > 0 ? (
            <div className="space-y-4">
              {vendasEmAndamento.map((venda) => (
                <CardVenda key={venda.id} venda={venda} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Você não tem nenhum pedido em andamento.</p>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2">Histórico de Pedidos</h2>
          {vendasConcluidas.length > 0 ? (
            <div className="space-y-4">
              {vendasConcluidas.map((venda) => (
                <CardVenda key={venda.id} venda={venda} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Você ainda não concluiu nenhum pedido.</p>
          )}
        </section>
      </div>
    </div>
  );
}
