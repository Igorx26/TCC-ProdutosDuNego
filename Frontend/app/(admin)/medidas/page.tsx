"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { buscarMedidas } from "@/lib/dados";
import { Medida } from "@/lib/definicoes";
import { useOrdenacao } from "@/lib/hooks";
import { FiSearch } from "react-icons/fi";

// Componente de ícone (reutilizado)
const IconeOrdenacao = ({ direcao }: { direcao: "asc" | "desc" | null }) => {
  if (!direcao) return <span className="text-gray-400">↕</span>;
  return direcao === "asc" ? <span className="text-blue-500">▲</span> : <span className="text-blue-500">▼</span>;
};

// Componente para renderizar a tabela de medidas
function TabelaMedidas({
  medidas,
  solicitarOrdenacao,
  configOrdenacao,
}: {
  medidas: Medida[];
  solicitarOrdenacao: (key: keyof Medida) => void;
  configOrdenacao: { key: keyof Medida; direcao: "asc" | "desc" } | null;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-3 font-semibold">
              <button onClick={() => solicitarOrdenacao("nome")} className="flex items-center gap-1">
                MEDIDA
                <IconeOrdenacao direcao={configOrdenacao?.key === "nome" ? configOrdenacao.direcao : null} />
              </button>
            </th>
            <th className="p-3 font-semibold">AÇÔES</th>
          </tr>
        </thead>
        <tbody>
          {medidas.map((medida) => (
            <tr key={medida.id} className="border-b hover:bg-gray-100">
              <td className="p-3 font-medium text-gray-900">{medida.nome}</td>
              <td className="p-3">
                <Link href={`/medidas/${medida.id}/editar`} className="text-blue-600 hover:underline font-medium">
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

// Componente principal da página
export default function PaginaMedidas() {
  const [abaAtiva, setAbaAtiva] = useState<"ativas" | "inativas">("ativas");
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      const dadosMedidas = await buscarMedidas();
      setMedidas(dadosMedidas);
      setCarregando(false);
    }
    carregarDados();
  }, []);

  const medidasFiltradas = useMemo(
    () => medidas.filter((m) => m.nome.toLowerCase().includes(filtro.toLowerCase())),
    [medidas, filtro]
  );

  const medidasAtivas = medidasFiltradas.filter((m) => m.ativo);
  const medidasInativas = medidasFiltradas.filter((m) => !m.ativo);

  const {
    itens: ativasOrdenadas,
    solicitarOrdenacao: ordenarAtivas,
    configOrdenacao: configAtivas,
  } = useOrdenacao(medidasAtivas);
  const {
    itens: inativasOrdenadas,
    solicitarOrdenacao: ordenarInativas,
    configOrdenacao: configInativas,
  } = useOrdenacao(medidasInativas);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">Gerenciar Medidas</h1>
        <Link
          href="/medidas/novo"
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Adicionar Medida
        </Link>
      </div>

      <div className="relative w-full sm:w-1/3 mb-4">
        <input
          type="text"
          placeholder="Filtrar por nome..."
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
            Ativas ({medidasAtivas.length})
          </button>
          <button
            onClick={() => setAbaAtiva("inativas")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              abaAtiva === "inativas"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Inativas ({medidasInativas.length})
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {carregando ? (
          <p className="text-center py-4">Carregando medidas...</p>
        ) : (
          <>
            {abaAtiva === "ativas" &&
              (medidasAtivas.length > 0 ? (
                <TabelaMedidas
                  medidas={ativasOrdenadas}
                  solicitarOrdenacao={ordenarAtivas}
                  configOrdenacao={configAtivas}
                />
              ) : (
                <p className="text-sm text-gray-500">Nenhuma medida ativa encontrada.</p>
              ))}
            {abaAtiva === "inativas" &&
              (medidasInativas.length > 0 ? (
                <TabelaMedidas
                  medidas={inativasOrdenadas}
                  solicitarOrdenacao={ordenarInativas}
                  configOrdenacao={configInativas}
                />
              ) : (
                <p className="text-sm text-gray-500">Nenhuma medida inativa encontrada.</p>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
