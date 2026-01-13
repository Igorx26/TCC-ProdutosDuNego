"use client";

import { useState } from "react";
import { toast } from "sonner";
import { solicitarRelatorio } from "@/lib/relatorios";

// Define um tipo para o estado dos filtros de vendas para melhor organização
type FiltrosVendas = {
  dataInicial: string;
  dataFinal: string;
  status: string; // 'TODOS' será o valor para não enviar o parâmetro
};

// Define um tipo para o estado dos filtros de compras
type FiltrosCompras = {
  dataInicial: string;
  dataFinal: string;
};

export default function PaginaRelatorios() {
  // Estados de carregamento individuais para cada relatório
  const [carregandoVendas, setCarregandoVendas] = useState(false);
  const [carregandoCompras, setCarregandoCompras] = useState(false);
  const [carregandoEstoque, setCarregandoEstoque] = useState(false);

  // Estado para os filtros do relatório de vendas
  const [filtrosVendas, setFiltrosVendas] = useState<FiltrosVendas>({
    dataInicial: "",
    dataFinal: "",
    status: "TODOS",
  });

  // Estado para os filtros do relatório de compras
  const [filtrosCompras, setFiltrosCompras] = useState<FiltrosCompras>({
    dataInicial: "",
    dataFinal: "",
  });

  // Manipuladores de eventos para atualizar os filtros
  const handleFiltroVendasChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltrosVendas((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiltroComprasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltrosCompras((prev) => ({ ...prev, [name]: value }));
  };

  // Função para gerar o Relatório de Vendas
  const gerarRelatorioVendas = async () => {
    if (!filtrosVendas.dataInicial || !filtrosVendas.dataFinal) {
      toast.error("Por favor, selecione a data inicial e final para o relatório de vendas.");
      return;
    }
    setCarregandoVendas(true);
    toast.info("Gerando relatório de vendas...");

    const params: Record<string, string> = {
      dataInicial: filtrosVendas.dataInicial,
      dataFinal: filtrosVendas.dataFinal,
    };

    // Apenas adiciona o status se não for 'TODOS'
    if (filtrosVendas.status !== "TODOS") {
      params.status = filtrosVendas.status;
    }
    
    const nomeArquivo = `relatorio_vendas_${filtrosVendas.dataInicial}_a_${filtrosVendas.dataFinal}.pdf`;

    try {
      await solicitarRelatorio("relatorios/vendas/pdf", nomeArquivo, params);
      toast.success("Relatório de vendas baixado com sucesso!");
    } catch (error) {
      console.error("Falha ao gerar relatório de vendas.");
    } finally {
      setCarregandoVendas(false);
    }
  };

  // Função para gerar o Relatório de Compras
  const gerarRelatorioCompras = async () => {
    if (!filtrosCompras.dataInicial || !filtrosCompras.dataFinal) {
        toast.error("Por favor, selecione a data inicial e final para o relatório de compras.");
        return;
    }
    setCarregandoCompras(true);
    toast.info("Gerando relatório de compras...");

    const params = {
        dataInicial: filtrosCompras.dataInicial,
        dataFinal: filtrosCompras.dataFinal,
    };
    const nomeArquivo = `relatorio_compras_${filtrosCompras.dataInicial}_a_${filtrosCompras.dataFinal}.pdf`;

    try {
        await solicitarRelatorio("relatorios/compras/pdf", nomeArquivo, params);
        toast.success("Relatório de compras baixado com sucesso!");
    } catch (error) {
        console.error("Falha ao gerar relatório de compras.");
    } finally {
        setCarregandoCompras(false);
    }
  };


  // Função para gerar o Relatório de Estoque (sem alterações na lógica)
  const gerarRelatorioEstoque = async () => {
    setCarregandoEstoque(true);
    toast.info("Gerando relatório de estoque...");
    
    const nomeArquivo = `relatorio_estoque_${new Date().toISOString().split('T')[0]}.pdf`;

    try {
      await solicitarRelatorio("relatorios/estoque/pdf", nomeArquivo);
      toast.success("Relatório de estoque baixado com sucesso!");
    } catch (error) {
      console.error("Falha ao gerar relatório de estoque.");
    } finally {
      setCarregandoEstoque(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-2xl font-bold">Gerar Relatórios</h1>

      {/* Card para Relatório de Vendas */}
      <div className="border p-4 rounded-lg space-y-4">
        <div>
          <h3 className="font-bold text-lg">Relatório de Vendas</h3>
          <p className="text-sm text-gray-600">
            Gera um PDF detalhado com as vendas registradas no período selecionado.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="dataInicialVendas" className="block text-sm font-medium text-gray-700">Data Inicial</label>
            <input type="date" id="dataInicialVendas" name="dataInicial" value={filtrosVendas.dataInicial} onChange={handleFiltroVendasChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="dataFinalVendas" className="block text-sm font-medium text-gray-700">Data Final</label>
            <input type="date" id="dataFinalVendas" name="dataFinal" value={filtrosVendas.dataFinal} onChange={handleFiltroVendasChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"/>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status da Venda</label>
            <select id="status" name="status" value={filtrosVendas.status} onChange={handleFiltroVendasChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm">
              <option value="TODOS">Todos</option>
              <option value="PAGO">Pago</option>
              <option value="ENTREGUE">Entregue</option>
              <option value="PENDENTE">Pendente</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>
        <button onClick={gerarRelatorioVendas} disabled={carregandoVendas} className="w-full md:w-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400">
          {carregandoVendas ? "Gerando..." : "Gerar PDF de Vendas"}
        </button>
      </div>

      {/* Card para Relatório de Compras */}
      <div className="border p-4 rounded-lg space-y-4">
          <div>
              <h3 className="font-bold text-lg">Relatório de Compras</h3>
              <p className="text-sm text-gray-600">
                  Gera um PDF com as compras de produtos no período selecionado.
              </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                  <label htmlFor="dataInicialCompras" className="block text-sm font-medium text-gray-700">Data Inicial</label>
                  <input type="date" id="dataInicialCompras" name="dataInicial" value={filtrosCompras.dataInicial} onChange={handleFiltroComprasChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"/>
              </div>
              <div>
                  <label htmlFor="dataFinalCompras" className="block text-sm font-medium text-gray-700">Data Final</label>
                  <input type="date" id="dataFinalCompras" name="dataFinal" value={filtrosCompras.dataFinal} onChange={handleFiltroComprasChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"/>
              </div>
          </div>
          <button onClick={gerarRelatorioCompras} disabled={carregandoCompras} className="w-full md:w-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400">
              {carregandoCompras ? "Gerando..." : "Gerar PDF de Compras"}
          </button>
      </div>

      {/* Card para Relatório de Estoque */}
      <div className="border p-4 rounded-lg flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">Relatório de Estoque</h3>
          <p className="text-sm text-gray-600">Gera um PDF com a lista de produtos ativos e suas quantidades em estoque.</p>
        </div>
        <button onClick={gerarRelatorioEstoque} disabled={carregandoEstoque} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400">
          {carregandoEstoque ? "Gerando..." : "Gerar PDF de Estoque"}
        </button>
      </div>
    </div>
  );
}