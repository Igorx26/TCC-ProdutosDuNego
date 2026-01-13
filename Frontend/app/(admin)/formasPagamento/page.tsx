"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { buscarFormasPagamento } from "@/lib/dados";
import { FormaPagamento } from "@/lib/definicoes";
import { useOrdenacao } from "@/lib/hooks";
import { FiSearch } from "react-icons/fi";

const IconeOrdenacao = ({ direcao }: { direcao: "asc" | "desc" | null }) => {
  if (!direcao) return <span className="text-gray-400">↕</span>;
  return direcao === "asc" ? <span className="text-blue-500">▲</span> : <span className="text-blue-500">▼</span>;
};

function TabelaFormasPagamento({
  formasPagamento,
  solicitarOrdenacao,
  configOrdenacao,
}: {
  formasPagamento: FormaPagamento[];
  solicitarOrdenacao: (key: keyof FormaPagamento) => void;
  configOrdenacao: { key: keyof FormaPagamento; direcao: "asc" | "desc" } | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-3 font-semibold">
              <button onClick={() => solicitarOrdenacao("descricao")} className="flex items-center gap-1">
                DESCRIÇÃO
                <IconeOrdenacao direcao={configOrdenacao?.key === "descricao" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {formasPagamento.map((fp) => (
            <tr key={fp.id} className="border-b hover:bg-gray-100">
              <td className="p-3 font-medium text-gray-900">{fp.descricao}</td>
              <td className="p-3">
                <Link href={`/formasPagamento/${fp.id}/editar`} className="text-blue-600 hover:underline font-medium">
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PaginaFormasPagamento() {
  const [abaAtiva, setAbaAtiva] = useState<"ativas" | "inativas">("ativas");
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      const dados = await buscarFormasPagamento();
      setFormasPagamento(dados);
      setCarregando(false);
    }
    carregarDados();
  }, []);

  const formasPagamentoFiltradas = useMemo(
    () => formasPagamento.filter((fp) => fp.descricao.toLowerCase().includes(filtro.toLowerCase())),
    [formasPagamento, filtro]
  );

  const ativas = formasPagamentoFiltradas.filter((fp) => fp.ativo);
  const inativas = formasPagamentoFiltradas.filter((fp) => !fp.ativo);

  const {
    itens: ativasOrdenadas,
    solicitarOrdenacao: ordenarAtivas,
    configOrdenacao: configAtivas,
  } = useOrdenacao(ativas);
  const {
    itens: inativasOrdenadas,
    solicitarOrdenacao: ordenarInativas,
    configOrdenacao: configInativas,
  } = useOrdenacao(inativas);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">Gerenciar Formas de Pagamento</h1>
        <Link
          href="/formasPagamento/novo"
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Adicionar Forma
        </Link>
      </div>

      <div className="relative w-full sm:w-1/3 mb-4">
        <input
          type="text"
          placeholder="Filtrar por descrição..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full rounded-md border border-gray-300 py-2 pl-10 text-sm outline-1 placeholder:text-gray-500"
        />
        <FiSearch className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setAbaAtiva("ativas")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              abaAtiva === "ativas"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Ativas ({ativas.length})
          </button>
          <button
            onClick={() => setAbaAtiva("inativas")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              abaAtiva === "inativas"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Inativas ({inativas.length})
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {carregando ? (
          <p className="text-center py-4">Carregando...</p>
        ) : (
          <>
            {abaAtiva === "ativas" &&
              (ativas.length > 0 ? (
                <TabelaFormasPagamento
                  formasPagamento={ativasOrdenadas}
                  solicitarOrdenacao={ordenarAtivas}
                  configOrdenacao={configAtivas}
                />
              ) : (
                <p className="text-sm text-gray-500">Nenhuma forma de pagamento ativa encontrada.</p>
              ))}
            {abaAtiva === "inativas" &&
              (inativas.length > 0 ? (
                <TabelaFormasPagamento
                  formasPagamento={inativasOrdenadas}
                  solicitarOrdenacao={ordenarInativas}
                  configOrdenacao={configInativas}
                />
              ) : (
                <p className="text-sm text-gray-500">Nenhuma forma de pagamento inativa encontrada.</p>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
