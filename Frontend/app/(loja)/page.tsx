import Image from "next/image";
import { ListaProdutos } from "@/components/produtos/ListaProdutos";
import { buscarProdutos, buscarCategorias } from "@/lib/dados";
import { groupProdutosPorCategoria } from "@/lib/uteis";

export default async function HomePage() {
  const produtos = await buscarProdutos();
  const categorias = await buscarCategorias();

  if (!produtos || produtos.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Nenhum produto encontrado.</h2>
        <p className="text-gray-600">Por favor, volte mais tarde.</p>
      </div>
    );
  }

  const produtosPorCategoria = groupProdutosPorCategoria(produtos, categorias);

  return (
    <div className="pt-14">
      <section className="w-full h-[500px] bg-zinc-900 bg-home bg-cover bg-center" id="home">
        <div className="w-full h-full flex flex-col justify-center items-center p-4 bg-black/30 text-center">
          <Image
            src="/assets/LogoProdutosduNego2.png"
            alt="Logo Produtos Du Nego"
            width={128}
            height={128}
            className="rounded-full shadow-lg hover:scale-110 duration-200"
            priority
          />
          <h1 className="text-4xl mt-4 mb-2 font-bold text-white">Produtos Du Nego</h1>
          <span className="text-white font-medium mb-1 mx-4">
            Rua Pedro Álvares Cabral, nº 64, Bairro de Fátima, Serra - ES
          </span>
          <span className="text-white font-medium mx-4">Entrega grátis em Bairro de Fátima e região.</span>
          <span className="text-white font-medium mx-4">Entre em contato para mais informações:</span>
          <div className="flex justify-center items-center gap-2 mx-4">
            <span className="text-white font-medium items-center">(27) 99871-3286</span>
          </div>
          <div className="bg-green-600 px-4 py-1 rounded-lg mt-3">
            <span className="text-white font-medium">Seg à Dom - 08:00 às 22:00</span>
          </div>
        </div>
      </section>
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-center mt-9 mb-10">Conheça nossos produtos</h2>

        {Object.entries(produtosPorCategoria).map(([categoria, produtos]) => (
          <ListaProdutos key={categoria} titulo={categoria} produtos={produtos} />
        ))}
      </div>
      <div className="pb-24"></div>
    </div>
  );
}
