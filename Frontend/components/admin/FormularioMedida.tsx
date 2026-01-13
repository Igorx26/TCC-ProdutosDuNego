import Link from "next/link";
import { Medida } from "@/lib/definicoes";

type EstadoFormulario = {
  erros?: {
    nome?: string[];
  };
};

interface FormularioMedidaProps {
  medida?: Medida;
  erros?: EstadoFormulario["erros"];
}

export function FormularioMedida({ medida, erros }: FormularioMedidaProps) {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">{medida ? "Editar Medida" : "Adicionar Nova Medida"}</h1>

      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
          Nome da Medida
        </label>
        <input
          type="text"
          name="nome"
          id="nome"
          defaultValue={medida?.nome}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
          required
          placeholder="Ex: Quilograma, Unidade, 500g"
        />
        {erros?.nome && <p className="text-sm text-red-500 mt-1">{erros.nome[0]}</p>}
      </div>

      <div className="flex items-center">
        <input
          id="ativo"
          name="ativo"
          type="checkbox"
          value="true"
          defaultChecked={medida?.ativo ?? true}
          className="h-4 w-4 text-red-600 border-gray-300 rounded"
        />
        <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
          Medida Ativa
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Link href="/medidas" className="bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
          Cancelar
        </Link>
        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
        >
          {medida ? "Salvar Alterações" : "Adicionar Medida"}
        </button>
      </div>
    </div>
  );
}
