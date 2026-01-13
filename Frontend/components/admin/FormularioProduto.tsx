"use client";

import { Categoria, Medida, Produto } from "@/lib/definicoes";
import Image from "next/image";
import { useState } from "react";

type EstadoFormulario = {
  erros?: {
    nome?: string[];
    descricao?: string[];
    observacao?: string[];
    imagem?: string[];
    valor?: string[];
    estoque?: string[];
    idCategoria?: string[];
    idMedida?: string[];
    ativo?: string[];
  };
};

interface FormularioProdutoProps {
  produto?: Produto;
  categorias: Categoria[];
  medidas: Medida[];
  erros?: EstadoFormulario["erros"];
}

export function FormularioProduto({ produto, categorias, medidas, erros }: FormularioProdutoProps) {
  const [previewImagem, setPreviewImagem] = useState<string | null>(produto?.imagem || null);

  const handleMudancaImagem = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImagem(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImagem(produto?.imagem || null);
    }
  };
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">{produto ? "Editar Produto" : "Adicionar Novo Produto"}</h1>
      {produto && <input type="hidden" name="id" value={produto.id} />}
      <div>
        <label htmlFor="nome" className="block text-sm font-medium">
          Nome do Produto
        </label>
        <input
          type="text"
          name="nome"
          id="nome"
          defaultValue={produto?.nome}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
          required
        />
        {erros?.nome && <p className="text-sm text-red-500 mt-1">{erros.nome[0]}</p>}
      </div>

      <div>
        <label htmlFor="descricao" className="block text-sm font-medium">
          Descrição
        </label>
        <textarea
          name="descricao"
          id="descricao"
          defaultValue={produto?.descricao || ""}
          rows={3}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
        ></textarea>
      </div>

      <div>
        <label htmlFor="observacao" className="block text-sm font-medium">
          Observação
        </label>
        <textarea
          name="observacao"
          id="observacao"
          defaultValue={produto?.observacao || ""}
          rows={3}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
        ></textarea>
      </div>

      <div>
        <label htmlFor="imagem" className="block text-sm font-medium">
          Imagem do Produto
        </label>
        {previewImagem && (
          <div className="mt-2">
            <Image
              src={previewImagem}
              alt="Pré-visualização"
              width={100}
              height={100}
              className="rounded-md object-cover"
            />
          </div>
        )}
        <input
          type="file"
          name="imagem"
          id="imagem"
          className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleMudancaImagem}
        />
        {erros?.imagem && <p className="text-sm text-red-500 mt-1">{erros.imagem[0]}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="valor" className="block text-sm font-medium">
            Valor (R$)
          </label>
          <input
            type="number"
            name="valor"
            id="valor"
            step="0.01"
            defaultValue={produto?.valor}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          />
          {erros?.valor && <p className="text-sm text-red-500 mt-1">{erros.valor[0]}</p>}
        </div>
        <div>
          <label htmlFor="estoque" className="block text-sm font-medium">
            Estoque
          </label>
          <input
            type="number"
            name="estoque"
            id="estoque"
            step="1"
            defaultValue={produto?.estoque}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          />
          {erros?.estoque && <p className="text-sm text-red-500 mt-1">{erros.estoque[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="idCategoria" className="block text-sm font-medium">
            Categoria
          </label>
          <select
            name="idCategoria"
            id="idCategoria"
            defaultValue={produto?.idCategoria}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="">Selecione...</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>
          {erros?.idCategoria && <p className="text-sm text-red-500 mt-1">{erros.idCategoria[0]}</p>}
        </div>
        <div>
          <label htmlFor="idMedida" className="block text-sm font-medium">
            Unidade de Medida
          </label>
          <select
            name="idMedida"
            id="idMedida"
            defaultValue={produto?.idMedida}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="">Selecione...</option>
            {medidas.map((med) => (
              <option key={med.id} value={med.id}>
                {med.nome}
              </option>
            ))}
          </select>
          {erros?.idMedida && <p className="text-sm text-red-500 mt-1">{erros.idMedida[0]}</p>}
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="ativo"
          name="ativo"
          type="checkbox"
          value="true"
          defaultChecked={produto?.ativo ?? true}
          className="h-4 w-4 text-red-600 border-gray-300 rounded"
        />
        <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
          Produto Ativo
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <a href="/produtos" className="bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
          Cancelar
        </a>
        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
        >
          {produto ? "Salvar Alterações" : "Adicionar Produto"}
        </button>
      </div>
    </div>
  );
}
