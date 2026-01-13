import { Categoria } from "@/lib/definicoes";
import Link from "next/link";

type EstadoFormulario = {
  erros?: {
    nome?: string[];
    descricao?: string[];
  };
};

interface FormularioCategoriaProps {
  categoria?: Categoria;
  erros?: EstadoFormulario["erros"];
}

export function FormularioCategoria({ categoria, erros }: FormularioCategoriaProps) {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">{categoria ? "Editar Categoria" : "Adicionar Nova Categoria"}</h1>
      {categoria && <input type="hidden" name="id" value={categoria.id} />}
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
          Nome da Categoria
        </label>
        <input
          type="text"
          name="nome"
          id="nome"
          defaultValue={categoria?.nome}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
          required
        />
        {erros?.nome && <p className="text-sm text-red-500 mt-1">{erros.nome[0]}</p>}
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
          Descrição (Opcional)
        </label>
        <textarea
          name="descricao"
          id="descricao"
          defaultValue={categoria?.descricao || ""}
          rows={4}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
        ></textarea>
      </div>

      <div className="flex items-center">
        <input
          id="ativo"
          name="ativo"
          type="checkbox"
          value="true"
          defaultChecked={categoria?.ativo ?? true}
          className="h-4 w-4 text-red-600 border-gray-300 rounded"
        />
        <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
          Categoria Ativa
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Link href="/categorias" className="bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
          Cancelar
        </Link>
        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
        >
          {categoria ? "Salvar Alterações" : "Adicionar Categoria"}
        </button>
      </div>
    </div>
  );
}
