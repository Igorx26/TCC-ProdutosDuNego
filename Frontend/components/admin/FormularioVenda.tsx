"use client";

import Link from "next/link";
import { Produto, FormaPagamento } from "@/lib/definicoes";
import { registrarVenda, EstadoAcao } from "@/lib/acoes";
import { useState, useMemo, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { FiTrash2, FiPlus } from "react-icons/fi";

// --- Sub-componente para o botão de envio ---
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {pending ? "Registrando..." : "Registrar Venda"}
    </button>
  );
}

// Tipo para um item na lista do formulário
type ItemFormulario = {
  id: number; // id do Produto
  nome: string;
  quantidade: number;
  valor: number;
};

interface FormularioVendaProps {
  produtosAtivos: Produto[];
  formasPagamentoAtivas: FormaPagamento[];
  token: string | null; // Recebe o token como propriedade
}

export function FormularioVenda({ produtosAtivos, formasPagamentoAtivas, token }: FormularioVendaProps) {
  const [formaPagamentoId, setFormaPagamentoId] = useState<number | null>(null);
  const [itensDaVenda, setItensDaVenda] = useState<ItemFormulario[]>([]);
  const [produtoAtualId, setProdutoAtualId] = useState("");
  const [quantidadeAtual, setQuantidadeAtual] = useState("1");
  const [valorAtual, setValorAtual] = useState("");

  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const [estado, dispatch] = useActionState(registrarVenda, estadoInicial);

  const payloadJSON = useMemo(() => {
    const itensParaApi = itensDaVenda.map((item) => ({
      idProduto: item.id,
      quantidade: item.quantidade,
      valor: item.valor,
    }));
    return JSON.stringify({
      idFormaPagamento: formaPagamentoId,
      itens: itensParaApi,
    });
  }, [formaPagamentoId, itensDaVenda]);

  useEffect(() => {
    if (produtoAtualId) {
      const produto = produtosAtivos.find((p) => p.id === Number(produtoAtualId));
      if (produto) {
        setValorAtual(String(produto.valor));
      }
    } else {
      setValorAtual("");
    }
  }, [produtoAtualId, produtosAtivos]);

  useEffect(() => {
    if (estado?.mensagem) {
      toast.error(estado.mensagem);
    }
  }, [estado]);

  const handleAdicionarItem = () => {
    if (!produtoAtualId || !quantidadeAtual || !valorAtual) {
      toast.error("Selecione um produto e informe a quantidade e o valor.");
      return;
    }
    const produtoSelecionado = produtosAtivos.find((p) => p.id === Number(produtoAtualId));
    if (!produtoSelecionado) return;

    if (itensDaVenda.some((item) => item.id === produtoSelecionado.id)) {
      toast.warning(`${produtoSelecionado.nome} já foi adicionado a esta venda.`);
      return;
    }

    const novoItem: ItemFormulario = {
      id: Number(produtoAtualId),
      nome: produtoSelecionado.nome,
      quantidade: Number(quantidadeAtual),
      valor: Number(valorAtual),
    };
    setItensDaVenda([...itensDaVenda, novoItem]);
    setProdutoAtualId("");
    setQuantidadeAtual("1");
    setValorAtual("");
  };

  const handleRemoverItem = (id: number) => setItensDaVenda(itensDaVenda.filter((item) => item.id !== id));

  const totalVenda = useMemo(
    () => itensDaVenda.reduce((total, item) => total + item.valor * item.quantidade, 0),
    [itensDaVenda]
  );

  return (
    <form action={dispatch} className="bg-white p-6 rounded-lg shadow-md">
      <input type="hidden" name="token" value={token || ""} />
      <input type="hidden" name="payload" value={payloadJSON} />

      <h1 className="text-2xl font-bold mb-6">Registrar Venda</h1>

      {/* --- Seção de Dados da Venda --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="block text-sm font-medium text-gray-700">Cliente</p>
          <p className="mt-1 block w-full bg-gray-100 rounded-md p-2 text-gray-500">Usuário Padrão</p>
        </div>
        <div>
          <label htmlFor="idFormaPagamento" className="block text-sm font-medium text-gray-700">
            Forma de Pagamento*
          </label>
          <select
            name="idFormaPagamento"
            id="idFormaPagamento"
            value={formaPagamentoId || ""}
            onChange={(e) => setFormaPagamentoId(Number(e.target.value))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="">Selecione...</option>
            {formasPagamentoAtivas.map((fp) => (
              <option key={fp.id} value={fp.id}>
                {fp.descricao}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Seção para Adicionar Itens --- */}
      <div className="border rounded-lg p-4 space-y-4 mb-6">
        <h3 className="font-semibold">Adicionar Produto à Venda</h3>
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

      {/* --- Lista de Itens da Venda --- */}
      <div className="space-y-2">
        <h3 className="font-semibold">Itens da Venda</h3>
        {itensDaVenda.length === 0 && <p className="text-sm text-gray-500">Nenhum item adicionado.</p>}
        {itensDaVenda.map((item) => (
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

      {/* --- Total e Ações --- */}
      <div className="border-t pt-4 mt-6 text-right">
        <p className="text-xl font-bold">
          Total da Venda: {totalVenda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      </div>
      <div className="flex justify-end gap-4 pt-6 mt-6">
        <Link href="/vendas" className="bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300">
          Cancelar
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}
