import Link from "next/link";
import { FormaPagamento } from "@/lib/definicoes";
import { EstadoAcao } from "@/lib/acoes";

interface FormularioFormaPagamentoProps {
  formaPagamento?: FormaPagamento;
  erros?: EstadoAcao["erros"];
}

export function FormularioFormaPagamento({ formaPagamento, erros }: FormularioFormaPagamentoProps) {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">
        {formaPagamento ? "Editar Forma de Pagamento" : "Adicionar Nova Forma de Pagamento"}
      </h1>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <input
          type="text"
          name="descricao"
          id="descricao"
          defaultValue={formaPagamento?.descricao}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
          required
          placeholder="Ex: Cartão de Crédito, PIX, Dinheiro"
        />
        {erros?.descricao && <p className="text-sm text-red-500 mt-1">{erros.descricao[0]}</p>}
      </div>

      <div className="flex items-center">
        <input
          id="ativo"
          name="ativo"
          type="checkbox"
          value="true"
          defaultChecked={formaPagamento?.ativo ?? true}
          className="h-4 w-4 text-red-600 border-gray-300 rounded"
        />
        <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
          Forma de Pagamento Ativa
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Link
          href="/formasPagamento"
          className="bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
        >
          {formaPagamento ? "Salvar Alterações" : "Adicionar Forma de Pagamento"}
        </button>
      </div>
    </div>
  );
}
