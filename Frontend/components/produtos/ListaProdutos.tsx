import { Produto } from "@/lib/definicoes";
import { CardProduto } from "./CardProduto";

interface ListaProdutosProps {
  titulo: string;
  produtos: Produto[];
}

export function ListaProdutos({ titulo, produtos }: ListaProdutosProps) {
  const produtosAtivos = produtos.filter((produto) => produto.ativo);

  // Se não houver produtos ativos nesta categoria, não renderiza a seção
  if (produtosAtivos.length === 0) {
    return null;
  }

  return (
    <section id={titulo.toLowerCase().replace(/ /g, "-")} className="mb-16">
      <div className="mx-auto max-w-7xl px-2 my-2">
        <h2 className="font-bold text-3xl mb-10 flex justify-center border-t-4 border-zinc-300 pt-10">{titulo}</h2>
      </div>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10 mx-auto max-w-7xl px-2">
        {/* Agora o map é feito na lista de produtos já filtrada */}
        {produtosAtivos.map((produto) => (
          <CardProduto key={produto.id} produto={produto} />
        ))}
      </main>
    </section>
  );
}
