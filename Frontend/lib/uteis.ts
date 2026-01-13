import { Produto, Categoria, Venda } from "./definicoes";

export function groupProdutosPorCategoria(produtos: Produto[], categorias: Categoria[]): Record<string, Produto[]> {
  const mapaCategorias = new Map(categorias.map((cat) => [cat.id, cat.nome]));

  return produtos.reduce((acc, produto) => {
    // Busca o nome da categoria no mapa usando o idCategoria do produto
    const nomeCategoria = mapaCategorias.get(produto.idCategoria) || "Sem Categoria";

    if (!acc[nomeCategoria]) {
      acc[nomeCategoria] = [];
    }
    acc[nomeCategoria].push(produto);
    return acc;
  }, {} as Record<string, Produto[]>);
}

export function getStatusVenda(venda: Venda): { cor: string; podeCancelar: boolean } {
  const idStatus = venda.idStatus;

  const podeCancelar = idStatus === 1;

  let cor: string;

  switch (idStatus) {
    case 1: // Em Aberto
      cor = "bg-gray-100 text-gray-800";
      break;
    case 2: // Separado
      cor = "bg-yellow-100 text-yellow-800";
      break;
    case 3: // Pago, aguardando entrega
      cor = "bg-blue-100 text-blue-800";
      break;
    case 4: // Entregue, aguardando pagamento
      cor = "bg-orange-100 text-orange-800";
      break;
    case 5: // Concluído
      cor = "bg-green-100 text-green-800";
      break;
    case 6: // Cancelado
      cor = "bg-red-100 text-red-800";
      break;
    default:
      cor = "bg-gray-100 text-gray-800";
      break;
  }

  return { cor, podeCancelar };
}
