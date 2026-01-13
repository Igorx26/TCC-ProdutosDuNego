"use client";

import Link from "next/link";
import { Produto, Fornecedor } from "@/lib/definicoes";
import { useState, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { FiTrash2, FiPlus } from "react-icons/fi";
import { EstadoAcao } from "@/lib/acoes";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {pending ? "Registrando..." : "Registrar Compra"}
    </button>
  );
}

type ItemFormulario = {
  id: number;
  nome: string;
  quantidade: number;
  valor: number;
};

interface FormularioCompraProps {
  produtosAtivos: Produto[];
  fornecedoresAtivos: Fornecedor[];
  token: string | null;
  estado: EstadoAcao;
  dispatch: (payload: FormData) => void;
}

export function FormularioCompra({
  produtosAtivos,
  fornecedoresAtivos,
  token,
  estado,
  dispatch,
}: FormularioCompraProps) {
  const [fornecedorId, setFornecedorId] = useState<number | null>(null);
  const [itensDaCompra, setItensDaCompra] = useState<ItemFormulario[]>([]);
  const [produtoAtualId, setProdutoAtualId] = useState("");
  const [quantidadeAtual, setQuantidadeAtual] = useState("");
  const [valorAtual, setValorAtual] = useState("");

  const payloadJSON = useMemo(() => {
    return JSON.stringify({ idFornecedor: fornecedorId, itens: itensDaCompra });
  }, [fornecedorId, itensDaCompra]);

  const handleAdicionarItem = () => {
    if (!produtoAtualId || !quantidadeAtual || !valorAtual) {
      toast.error("Preencha todos os campos do item para adicionar.");
      return;
    }
    if (!fornecedorId) {
      toast.error("Selecione um fornecedor antes de adicionar itens.");
      return;
    }
    const produtoSelecionado = produtosAtivos.find((p) => p.id === Number(produtoAtualId));
    if (!produtoSelecionado) return;

    if (itensDaCompra.some((item) => item.id === produtoSelecionado.id)) {
      toast.warning(`${produtoSelecionado.nome} já foi adicionado a esta compra.`);
      return;
    }
    const novoItem: ItemFormulario = {
      id: Number(produtoAtualId),
      nome: produtoSelecionado.nome,
      quantidade: Number(quantidadeAtual),
      valor: Number(valorAtual),
    };
    setItensDaCompra([...itensDaCompra, novoItem]);

    setProdutoAtualId("");
    setQuantidadeAtual("");
    setValorAtual("");
  };

  const handleRemoverItem = (id: number) => {
    setItensDaCompra(itensDaCompra.filter((item) => item.id !== id));
  };

  const totalDaCompra = useMemo(() => {
    return itensDaCompra.reduce((total, item) => total + item.valor * item.quantidade, 0);
  }, [itensDaCompra]);

  return (
    <form action={dispatch} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <input type="hidden" name="token" value={token || ""} />
      <input type="hidden" name="payload" value={payloadJSON} />

      <h1 className="text-2xl font-bold">Registrar Nova Compra</h1>

      {/* Seção do Fornecedor */}
      <div className="mb-6">
        <label htmlFor="idFornecedor" className="block text-sm font-medium text-gray-700">
          Fornecedor*
        </label>
        <select
          name="idFornecedor"
          id="idFornecedor"
          onChange={(e) => setFornecedorId(Number(e.target.value))}
          disabled={itensDaCompra.length > 0}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 disabled:bg-gray-100"
          required
        >
          <option value="">Selecione um fornecedor...</option>
          {fornecedoresAtivos.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nomeVendedor} ({f.empresa || "Pessoa Física"})
            </option>
          ))}
        </select>
      </div>

      {/* Seção para Adicionar Itens */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold">Adicionar Produto à Compra</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <select
            value={produtoAtualId}
            onChange={(e) => setProdutoAtualId(e.target.value)}
            className="md:col-span-2 p-2 border rounded-md h-full"
          >
            <option value="">Selecione um produto...</option>
            {produtosAtivos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={quantidadeAtual}
            onChange={(e) => setQuantidadeAtual(e.target.value)}
            placeholder="Quantidade"
            className="p-2 border rounded-md"
          />
          <input
            type="number"
            step="0.01"
            value={valorAtual}
            onChange={(e) => setValorAtual(e.target.value)}
            placeholder="Valor Unit."
            className="p-2 border rounded-md"
          />
        </div>
        <button
          type="button"
          onClick={handleAdicionarItem}
          className="w-full bg-red-600 text-white font-bold py-2 rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
        >
          <FiPlus /> Adicionar Item
        </button>
      </div>

      {/* Lista de Itens Adicionados */}
      <div className="space-y-2">
        <h3 className="font-semibold">Itens da Compra</h3>
        {itensDaCompra.length === 0 && <p className="text-sm text-gray-500">Nenhum item adicionado.</p>}
        {itensDaCompra.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm">
            <div>
              <span className="font-medium">{item.nome}</span>
              <span className="text-gray-600">
                {" "}
                ({item.quantidade} x {item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleRemoverItem(item.id)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Total e Botões de Ação */}
      <div className="border-t pt-4 mt-6 text-right">
        <p className="text-lg font-bold">
          Total da Compra: {totalDaCompra.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      </div>
      <div className="flex justify-end gap-4">
        <Link href="/compras" className="bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
          Cancelar
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}
