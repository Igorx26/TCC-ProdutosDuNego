"use client";

import { useState, useEffect, useMemo, useActionState } from "react";
import { useCarrinho } from "@/contexts/ContextoCarrinho";
import { useAuth } from "@/contexts/ContextoAuth";
import { useRouter } from "next/navigation";
import { Endereco, FormaPagamento } from "@/lib/definicoes";
import { buscarMeusEnderecos, buscarFormasPagamento } from "@/lib/dados";
import { EstadoAcao, registrarVenda } from "@/lib/acoes";
import { toast } from "sonner";
import { useFormStatus } from "react-dom";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

const CarregandoSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
  </div>
);

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-wait"
    >
      {pending ? "Finalizando..." : "Finalizar Pedido"}
    </button>
  );
}

export default function PaginaCheckout() {
  const { carrinho, totalCarrinho, totalItens, limparCarrinho } = useCarrinho();
  const { usuario, carregando: carregandoAuth } = useAuth();
  const router = useRouter();

  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [tipoEntrega, setTipoEntrega] = useState<"entrega" | "retirada">("entrega");
  const [enderecoSelecionadoId, setEnderecoSelecionadoId] = useState<number | null>(null);
  const [formaPagamentoSelecionadaId, setFormaPagamentoSelecionadaId] = useState<number | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [observacaoCliente, setObservacaoCliente] = useState("");
  const [verificando, setVerificando] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const [estado, dispatch] = useActionState(registrarVenda, estadoInicial);

  useEffect(() => {
    if (estado.mensagem?.includes("sucesso")) {
      return;
    }

    const tokenArmazenado = localStorage.getItem(AUTH_TOKEN_KEY);
    if (tokenArmazenado) {
      setToken(tokenArmazenado);
    }

    if (!carregandoAuth) {
      if (!usuario) {
        router.push("/login");
        return;
      }
      if (totalItens === 0) {
        router.push("/");
        return;
      }

      async function carregarDadosCheckout() {
        setVerificando(true);
        const [dadosEnderecos, dadosFormasPagamento] = await Promise.all([
          buscarMeusEnderecos(),
          buscarFormasPagamento(),
        ]);
        const formasPagamentoAtivas = dadosFormasPagamento.filter((fp) => fp.ativo);
        setEnderecos(dadosEnderecos);
        setFormasPagamento(formasPagamentoAtivas);
        const enderecoPrincipal = dadosEnderecos.find((e) => e.isPrincipal);
        if (enderecoPrincipal) {
          setEnderecoSelecionadoId(enderecoPrincipal.id);
        } else if (dadosEnderecos.length > 0) {
          setEnderecoSelecionadoId(dadosEnderecos[0].id);
        }
        if (formasPagamentoAtivas.length > 0) {
          setFormaPagamentoSelecionadaId(formasPagamentoAtivas[0].id);
        }
        setVerificando(false);
      }

      carregarDadosCheckout();
    }
  }, [usuario, totalItens, router, carregandoAuth, estado.mensagem]);

  useEffect(() => {
    if (estado?.mensagem) {
      if (estado.mensagem.includes("sucesso")) {
        toast.success(estado.mensagem);
        limparCarrinho();
        setTimeout(() => {
          router.push("/meusPedidos");
        }, 1500);
      } else {
        toast.error(estado.mensagem);
      }
    }
  }, [estado, router, limparCarrinho]);

  const payloadJSON = useMemo(() => {
    const itens = carrinho.map((item) => ({
      idProduto: item.id,
      quantidade: item.quantidade,
      valor: item.valor,
    }));
    return JSON.stringify({
      idFormaPagamento: formaPagamentoSelecionadaId,
      idUsuarioEndereco: tipoEntrega === "entrega" ? enderecoSelecionadoId : null,
      observacaoCliente: observacaoCliente,
      entrega: tipoEntrega === "entrega",
      dataParaEntrega: dataSelecionada,
      horaParaEntrega: horaSelecionada,
      itens: itens,
    });
  }, [
    carrinho,
    formaPagamentoSelecionadaId,
    enderecoSelecionadoId,
    observacaoCliente,
    tipoEntrega,
    dataSelecionada,
    horaSelecionada,
  ]);

  const getDataMinima = () => new Date().toISOString().split("T")[0];

  const gerarHorarios = () => {
    const horarios = [];
    const dataHoraAtual = new Date();
    const horaMinima = new Date(dataHoraAtual.getTime() + 2 * 60 * 60 * 1000);
    let horaInicial = 8;
    if (dataSelecionada === getDataMinima() && dataHoraAtual.getHours() + 2 >= horaInicial) {
      horaInicial = horaMinima.getHours() + 1;
    }
    for (let hour = horaInicial; hour <= 22; hour++) {
      horarios.push(`${String(hour).padStart(2, "0")}:00`);
      if (hour < 22) {
        horarios.push(`${String(hour).padStart(2, "0")}:30`);
      }
    }
    return horarios;
  };

  if (carregandoAuth || verificando) {
    return <CarregandoSpinner />;
  }

  return (
    <form action={dispatch}>
      <input type="hidden" name="token" value={token || ""} />
      <input type="hidden" name="payload" value={payloadJSON} />

      <div className="min-h-screen bg-[#f0f3fd] pt-20 pb-12">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Opção de Entrega */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Opção de Entrega</h2>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setTipoEntrega("entrega")}
                    className={`px-4 py-2 rounded-lg w-full ${
                      tipoEntrega === "entrega" ? "bg-red-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    Entrega
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoEntrega("retirada")}
                    className={`px-4 py-2 rounded-lg w-full ${
                      tipoEntrega === "retirada" ? "bg-red-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    Retirada
                  </button>
                </div>

                {tipoEntrega === "entrega" && (
                  <div className="mt-4 space-y-2">
                    <h3 className="font-medium">Selecione o endereço:</h3>
                    {enderecos.map((endereco) => (
                      <label
                        key={endereco.id}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="address"
                          value={endereco.id}
                          checked={enderecoSelecionadoId === endereco.id}
                          onChange={() => setEnderecoSelecionadoId(endereco.id)}
                          className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-3 text-sm">{`${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}`}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Agendamento */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Agendamento</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium">
                      Data
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      min={getDataMinima()}
                      value={dataSelecionada}
                      onChange={(e) => setDataSelecionada(e.target.value)}
                      className="mt-1 w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium">
                      Hora
                    </label>
                    <select
                      id="time"
                      name="time"
                      value={horaSelecionada}
                      onChange={(e) => setHoraSelecionada(e.target.value)}
                      className="mt-1 w-full p-2 border rounded-md"
                      disabled={!dataSelecionada}
                    >
                      <option value="">Selecione</option>
                      {gerarHorarios().map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Observação do Cliente */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Observações do Pedido</h2>
                <textarea
                  name="observacaoCliente"
                  value={observacaoCliente}
                  onChange={(e) => setObservacaoCliente(e.target.value)}
                  rows={3}
                  placeholder="Ex: Ponto de referência, deixar na portaria, etc."
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                ></textarea>
              </div>

              {/* Forma de Pagamento */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Forma de Pagamento na Entrega</h2>
                <div className="space-y-2">
                  {formasPagamento.map((forma) => (
                    <label
                      key={forma.id}
                      className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={forma.id}
                        checked={formaPagamentoSelecionadaId === forma.id}
                        onChange={() => setFormaPagamentoSelecionadaId(forma.id)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-3 text-sm">{forma.descricao}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna do Resumo do Pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow sticky top-24">
                <h2 className="text-xl font-semibold mb-4 border-b pb-4">Resumo do Pedido</h2>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {carrinho.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="flex-1 pr-2">
                        {item.quantidade}x {item.nome}
                      </span>
                      <span className="font-medium">
                        {(item.valor * item.quantidade).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{totalCarrinho.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                <SubmitButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
