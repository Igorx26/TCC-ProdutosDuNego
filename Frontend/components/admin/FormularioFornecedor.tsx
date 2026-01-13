"use client";

import Link from "next/link";
import { Fornecedor } from "@/lib/definicoes";
import { EstadoAcao } from "@/lib/acoes";
import { useState } from "react";
import { IMaskInput } from "react-imask";

interface FormularioFornecedorProps {
  fornecedor?: Fornecedor;
  erros?: EstadoAcao["erros"];
  mensagem?: string | null;
}

export function FormularioFornecedor({ fornecedor, erros, mensagem }: FormularioFornecedorProps) {
  const [celularVendedor, setCelularVendedor] = useState(fornecedor?.celularVendedor || "");
  const [telefoneEmpresa, setTelefoneEmpresa] = useState(fornecedor?.telefoneEmpresa || "");
  const [cnpj, setCnpj] = useState(fornecedor?.cnpj || "");

  const handleCelularChange = (value: string) => {
    setCelularVendedor(value);
  };
  const handleTelefoneChange = (value: string) => {
    setTelefoneEmpresa(value);
  };
  const handleCnpjChange = (value: string) => {
    setCnpj(value);
  };

  const mascaraTelefone = [{ mask: "(00) 0000-0000" }, { mask: "(00) 00000-0000" }];

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">{fornecedor ? "Editar Fornecedor" : "Adicionar Novo Fornecedor"}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="nomeVendedor" className="block text-sm font-medium text-gray-700">
            Nome do Vendedor*
          </label>
          <input
            type="text"
            name="nomeVendedor"
            id="nomeVendedor"
            defaultValue={fornecedor?.nomeVendedor}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          />
          {erros?.nomeVendedor && <p className="text-sm text-red-500 mt-1">{erros.nomeVendedor[0]}</p>}
        </div>
        <div>
          <label htmlFor="celularVendedor" className="block text-sm font-medium text-gray-700">
            Celular do Vendedor*
          </label>
          <IMaskInput
            mask="(00) 00000-0000"
            type="tel"
            name="celularVendedor"
            id="celularVendedor"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
            value={celularVendedor}
            onAccept={handleCelularChange}
          />
          {erros?.celularVendedor && <p className="text-sm text-red-500 mt-1">{erros.celularVendedor[0]}</p>}
        </div>
      </div>

      <div className="border-t pt-6 space-y-6">
        <h2 className="text-lg font-medium text-gray-800">Dados da Empresa (Opcional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="empresa" className="block text-sm font-medium text-gray-700">
              Nome da Empresa
            </label>
            <input
              type="text"
              name="empresa"
              id="empresa"
              defaultValue={fornecedor?.empresa || ""}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">
              CNPJ
            </label>
            <IMaskInput
              mask="00.000.000/0000-00"
              name="cnpj"
              id="cnpj"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
              value={cnpj}
              onAccept={handleCnpjChange}
            />
            {erros?.cnpj && <p className="text-sm text-red-500 mt-1">{erros.cnpj[0]}</p>}
          </div>
          <div>
            <label htmlFor="telefoneEmpresa" className="block text-sm font-medium text-gray-700">
              Telefone da Empresa
            </label>
            <IMaskInput
              mask={mascaraTelefone}
              name="telefoneEmpresa"
              id="telefoneEmpresa"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
              value={telefoneEmpresa}
              onAccept={handleTelefoneChange}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email de Contato
            </label>
            <input
              type="email"
              name="email"
              id="email"
              defaultValue={fornecedor?.email || ""}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            />
            {erros?.email && <p className="text-sm text-red-500 mt-1">{erros.email[0]}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="ativo"
          name="ativo"
          type="checkbox"
          value="true"
          defaultChecked={fornecedor ? fornecedor.ativo : true}
          className="h-4 w-4 text-red-600 border-gray-300 rounded"
        />
        <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
          Fornecedor Ativo
        </label>
      </div>

      {mensagem && <p className="text-sm text-center text-red-500">{mensagem}</p>}

      <div className="flex justify-end gap-4 pt-4">
        <Link href="/fornecedores" className="bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
          Cancelar
        </Link>
        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
        >
          {fornecedor ? "Salvar Alterações" : "Adicionar Fornecedor"}
        </button>
      </div>
    </div>
  );
}
