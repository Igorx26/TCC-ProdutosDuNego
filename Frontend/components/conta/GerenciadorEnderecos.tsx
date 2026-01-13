"use client";

import { useState, useEffect, useCallback, useActionState } from "react";
import { Endereco } from "@/lib/definicoes";
import { FormularioEndereco } from "./FormularioEndereco";
import { buscarMeusEnderecos } from "@/lib/dados";
import { toast } from "sonner";
import { definirEnderecoPrincipal, deletarEndereco } from "@/lib/acoes";
import { useFormStatus } from "react-dom";

function BotaoExcluirEndereco({
  id,
  token,
  onExclusaoSucesso,
}: {
  id: number;
  token: string | null;
  onExclusaoSucesso: () => void;
}) {
  const deletarEnderecoComId = deletarEndereco.bind(null, id);
  const [estado, dispatch] = useActionState(deletarEnderecoComId, { mensagem: null });
  const { pending } = useFormStatus();

  useEffect(() => {
    if (estado?.mensagem) {
      if (estado.mensagem.includes("sucesso")) {
        toast.success(estado.mensagem);
        onExclusaoSucesso();
      } else {
        toast.error(estado.mensagem);
      }
    }
  }, [estado, onExclusaoSucesso]);

  const handleExcluirClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!window.confirm("Tem certeza que deseja excluir este endereço?")) {
      event.preventDefault();
    }
  };

  return (
    <form action={dispatch}>
      <input type="hidden" name="token" value={token || ""} />
      <button
        type="submit"
        className="text-red-600 text-sm hover:underline disabled:text-gray-400 disabled:cursor-wait"
        disabled={pending}
        onClick={handleExcluirClick}
      >
        {pending ? "Excluindo..." : "Excluir"}
      </button>
    </form>
  );
}

function BotaoDefinirPrincipal({ id, token, onSucesso }: { id: number; token: string | null; onSucesso: () => void }) {
  const definirPrincipalComId = definirEnderecoPrincipal.bind(null, id);
  const [estado, dispatch] = useActionState(definirPrincipalComId, { mensagem: null });
  const { pending } = useFormStatus();

  useEffect(() => {
    if (estado?.mensagem) {
      if (estado.mensagem.includes("sucesso")) {
        toast.success(estado.mensagem);
        onSucesso();
      } else {
        toast.error(estado.mensagem);
      }
    }
  }, [estado, onSucesso]);

  return (
    <form action={dispatch}>
      <input type="hidden" name="token" value={token || ""} />
      <button
        type="submit"
        // Desabilita o botão se a ação estiver pendente OU se não houver token
        disabled={pending || !token}
        className="text-green-600 text-sm hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
        title={!token ? "Faça login para realizar esta ação" : "Definir este endereço como principal"}
      >
        {pending ? "Definindo..." : "Definir como principal"}
      </button>
    </form>
  );
}

interface GerenciadorEnderecosProps {
  enderecosIniciais: Endereco[];
  token: string | null;
}

export function GerenciadorEnderecos({ enderecosIniciais, token }: GerenciadorEnderecosProps) {
  const [enderecos, setEnderecos] = useState(enderecosIniciais);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enderecoEmEdicao, setEnderecoEmEdicao] = useState<Endereco | null>(null);

  const recarregarEnderecos = useCallback(async () => {
    const novosEnderecos = await buscarMeusEnderecos();
    setEnderecos(novosEnderecos);
  }, []);

  useEffect(() => {
    setEnderecos(enderecosIniciais);
  }, [enderecosIniciais]);

  const handleEditar = (endereco: Endereco) => {
    setEnderecoEmEdicao(endereco);
    setMostrarFormulario(true);
  };

  const handleAdicionarNovo = () => {
    setEnderecoEmEdicao(null);
    setMostrarFormulario(true);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Meus Endereços</h2>
        {enderecos.length < 3 && !mostrarFormulario && (
          <button
            onClick={handleAdicionarNovo}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700"
          >
            Adicionar Novo
          </button>
        )}
      </div>

      {mostrarFormulario ? (
        <FormularioEndereco
          endereco={enderecoEmEdicao}
          onClose={() => setMostrarFormulario(false)}
          onSave={recarregarEnderecos}
        />
      ) : (
        <div className="space-y-4">
          {enderecos.map((endereco) => (
            <div
              key={endereco.id}
              className={`border rounded-lg p-4 flex justify-between items-start ${
                endereco.isPrincipal ? "border-red-500" : "border-gray-300"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{`${endereco.logradouro}, ${endereco.numero}`}</p>
                  {endereco.isPrincipal && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Principal
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{`${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}`}</p>
                <p className="text-sm text-gray-600">{`CEP: ${endereco.cep}`}</p>
                {endereco.complemento && (
                  <p className="text-sm text-gray-600">{`Complemento: ${endereco.complemento}`}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-4">
                <button onClick={() => handleEditar(endereco)} className="text-blue-600 text-sm hover:underline">
                  Editar
                </button>
                {endereco.isPrincipal ? (
                  <span className="text-sm text-gray-500" title="Não é possível excluir o endereço principal.">
                    Excluir
                  </span>
                ) : (
                  <>
                    <BotaoExcluirEndereco id={endereco.id} token={token} onExclusaoSucesso={recarregarEnderecos} />
                    <BotaoDefinirPrincipal id={endereco.id} token={token} onSucesso={recarregarEnderecos} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {enderecos.length === 0 && !mostrarFormulario && (
        <p className="text-gray-500 text-center py-4">Nenhum endereço cadastrado.</p>
      )}
    </div>
  );
}
