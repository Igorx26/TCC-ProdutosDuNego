import { buscarProdutos, buscarVendas } from "@/lib/dados";
import Link from "next/link";
import { FiDollarSign, FiShoppingCart, FiPackage, FiAlertTriangle } from "react-icons/fi";
import { Produto, Venda } from "@/lib/definicoes";

function CardDeEstatistica({
  titulo,
  valor,
  icone,
}: {
  titulo: string;
  valor: string | number;
  icone: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
      <div className="bg-red-100 p-3 rounded-full">{icone}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{titulo}</p>
        <p className="text-2xl font-bold text-gray-900">{valor}</p>
      </div>
    </div>
  );
}

// O componente agora espera Venda, mas sua lógica interna não muda
function UltimasVendas({ vendas }: { vendas: Venda[] }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-bold text-lg mb-4">Últimas Vendas</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <tbody>
            {vendas.slice(0, 5).map((venda) => (
              <tr key={venda.id} className="border-b last:border-none">
                <td className="p-3">
                  <p className="font-medium">
                    Pedido #{venda.id} - {venda.nomeCliente}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(venda.dataHora!).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                  </p>
                </td>
                <td className="p-3 text-right font-semibold">
                  {venda.totalLiquido?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="p-3 text-right">
                  {/* Link pode apontar para a página de gerenciamento de vendas */}
                  <Link href={`/vendas`} className="text-blue-600 hover:underline">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Componente para a tabela de Produtos com Baixo Estoque
function BaixoEstoque({ produtos }: { produtos: Produto[] }) {
  const limiteEstoque = 5;
  const produtosComBaixoEstoque = produtos
    .filter((p) => p.estoque <= limiteEstoque)
    .sort((a, b) => a.estoque - b.estoque);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-bold text-lg mb-4 text-orange-600 flex items-center gap-2">
        <FiAlertTriangle />
        Produtos com estoque menor que {limiteEstoque}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <tbody>
            {produtosComBaixoEstoque.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-3 text-center text-gray-500">
                  Nenhum produto com estoque estoque menor que {limiteEstoque}
                </td>
              </tr>
            ) : (
              produtosComBaixoEstoque.slice(0, 5).map((produto) => (
                <tr key={produto.id} className="border-b last:border-none">
                  <td className="p-3 font-medium">{produto.nome}</td>
                  <td className="p-3 text-right">
                    <span className="font-bold text-red-600">{produto.estoque}</span> em estoque
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/produtos/${produto.id}/editar`} className="text-blue-600 hover:underline">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function PaginaDashboard() {
  // A busca de dados permanece a mesma, mas 'vendas' agora é Venda[]
  const [vendas, produtos] = await Promise.all([buscarVendas(), buscarProdutos()]);

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const vendasDoMes = vendas.filter((venda) => {
    if (!venda.dataHora) return false;
    const dataVenda = new Date(venda.dataHora);
    return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
  });

  const vendasRecentes = vendas.sort((a, b) => new Date(b.dataHora!).getTime() - new Date(a.dataHora!).getTime());

  const vendasNoMes = vendasDoMes.reduce((soma, venda) => soma + (venda.totalLiquido || 0), 0);
  const totalDeVendasNoMes = vendasDoMes.length;
  const totalDeProdutosAtivos = produtos.filter((p) => p.ativo).length;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardDeEstatistica
          titulo="Valor Vendas no Mês"
          valor={vendasNoMes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icone={<FiDollarSign className="text-red-600" size={24} />}
        />
        <CardDeEstatistica
          titulo="Qtd Vendas no Mês"
          valor={totalDeVendasNoMes}
          icone={<FiShoppingCart className="text-red-600" size={24} />}
        />
        <CardDeEstatistica
          titulo="Produtos Ativos"
          valor={totalDeProdutosAtivos}
          icone={<FiPackage className="text-red-600" size={24} />}
        />
      </div>

      {/* Seção de Conteúdo Principal com as duas novas tabelas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <UltimasVendas vendas={vendasRecentes} />
        <BaixoEstoque produtos={produtos} />
      </div>
    </div>
  );
}
