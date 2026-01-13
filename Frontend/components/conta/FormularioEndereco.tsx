"use client";

import { useActionState, useState, useEffect } from "react";
import { Endereco } from "@/lib/definicoes";
import { adicionarEndereco, editarEndereco, EstadoAcao } from "@/lib/acoes";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";
import { useFormStatus } from "react-dom";

// Adicione este componente para o botão de submit
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-wait"
      disabled={pending}
    >
      {pending ? "Salvando..." : "Salvar"}
    </button>
  );
}

interface FormularioEnderecoProps {
  endereco: Endereco | null;
  onClose: () => void;
  onSave: () => void;
}

export function FormularioEndereco({ endereco, onClose, onSave }: FormularioEnderecoProps) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token")
      : null;

  // --- AQUI ESTÁ A CORREÇÃO ---
  // Criamos um "wrapper" para a ação que será usada no formulário.
  // Esta função wrapper tem a assinatura exata que o useActionState espera.
  const formAction = async (prevState: EstadoAcao, formData: FormData) => {
    if (endereco) {
      // Se estamos editando, chamamos a action de edição com o ID
      return editarEndereco(endereco.id, prevState, formData);
    } else {
      // Se estamos criando, chamamos a action de adição
      return adicionarEndereco(prevState, formData);
    }
  };

  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  // O useActionState agora recebe a nossa função wrapper, que não tem mais ambiguidade de tipo.
  const [estado, dispatch] = useActionState(formAction, estadoInicial);

  // Estados para os campos controlados (o resto do código permanece o mesmo)
  const [cep, setCep] = useState(endereco?.cep || "");
  const [logradouro, setLogradouro] = useState(endereco?.logradouro || "");
  const [numero, setNumero] = useState(endereco?.numero || "");
  const [complemento, setComplemento] = useState(endereco?.complemento || "");
  const [bairro, setBairro] = useState(endereco?.bairro || "");
  const [cidade, setCidade] = useState(endereco?.cidade || "");
  const [uf, setUf] = useState(endereco?.uf || "");
  const [buscandoCep, setBuscandoCep] = useState(false);

  useEffect(() => {
    if (estado?.mensagem) {
      if (estado.mensagem.includes("sucesso")) {
        toast.success(estado.mensagem);
        onSave();
        onClose();
      } else {
        toast.error(estado.mensagem);
      }
    }
  }, [estado, onClose, onSave]);

  const buscarEnderecoPorCep = async (cepValue: string) => {
    const cepLimpo = cepValue.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      if (!response.ok) throw new Error("CEP não encontrado");
      const data = await response.json();
      if (data.erro) {
        toast.error("CEP não encontrado ou inválido.");
        return;
      }
      setLogradouro(data.logradouro);
      setBairro(data.bairro);
      setCidade(data.localidade);
      setUf(data.uf);
      toast.success("Endereço encontrado!");
      document.getElementById("numero")?.focus();
    } catch (error) {
      toast.error("Falha ao buscar o CEP. Tente novamente.");
      console.error("Erro na API ViaCEP:", error);
    } finally {
      setBuscandoCep(false);
    }
  };

  return (
    <form action={dispatch} className="space-y-4 border-t pt-4 mt-4">
      <input type="hidden" name="token" value={token || ""} />
      <h3 className="font-semibold text-lg">{endereco ? "Editar Endereço" : "Adicionar Novo Endereço"}</h3>

      <div>
        <label htmlFor="cep" className="block text-sm font-medium text-gray-700">
          CEP*:
        </label>
        <IMaskInput
          mask="00000-000"
          id="cep"
          name="cep"
          placeholder="Ex: 49000-000"
          required
          className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          value={cep}
          onAccept={setCep}
          onBlur={(e) => buscarEnderecoPorCep(e.target.value)}
          disabled={buscandoCep}
        />
        {buscandoCep && <p className="text-sm text-gray-500 mt-1">Buscando CEP...</p>}
        {estado.erros?.cep && <p className="text-sm text-red-500 mt-1">{estado.erros.cep[0]}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="logradouro" className="block text-sm font-medium text-gray-700">
            Logradouro (Rua, Av.)*:
          </label>
          <input
            type="text"
            id="logradouro"
            name="logradouro"
            placeholder="Ex: Rua das Flores"
            required
            className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            value={logradouro}
            onChange={(e) => setLogradouro(e.target.value)}
          />
          {estado.erros?.logradouro && <p className="text-sm text-red-500 mt-1">{estado.erros.logradouro[0]}</p>}
        </div>
        <div>
          <label htmlFor="numero" className="block text-sm font-medium text-gray-700">
            Número*:
          </label>
          <input
            type="text"
            id="numero"
            name="numero"
            placeholder="Ex: 123"
            required
            className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
          {estado.erros?.numero && <p className="text-sm text-red-500 mt-1">{estado.erros.numero[0]}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="complemento" className="block text-sm font-medium text-gray-700">
          Complemento:
        </label>
        <input
          type="text"
          id="complemento"
          name="complemento"
          placeholder="Ex: Apto 4B"
          className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          value={complemento}
          onChange={(e) => setComplemento(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
          Bairro*:
        </label>
        <input
          type="text"
          id="bairro"
          name="bairro"
          placeholder="Ex: Centro"
          required
          className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
        />
        {estado.erros?.bairro && <p className="text-sm text-red-500 mt-1">{estado.erros.bairro[0]}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
            Cidade*:
          </label>
          <input
            type="text"
            id="cidade"
            name="cidade"
            placeholder="Ex: São Paulo"
            required
            className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />
          {estado.erros?.cidade && <p className="text-sm text-red-500 mt-1">{estado.erros.cidade[0]}</p>}
        </div>
        <div>
          <label htmlFor="uf" className="block text-sm font-medium text-gray-700">
            UF*:
          </label>
          <input
            type="text"
            id="uf"
            name="uf"
            placeholder="Ex: SP"
            required
            maxLength={2}
            className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            value={uf}
            onChange={(e) => setUf(e.target.value.toUpperCase())}
          />
          {estado.erros?.uf && <p className="text-sm text-red-500 mt-1">{estado.erros.uf[0]}</p>}
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-4">
        <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">
          Cancelar
        </button>
        <SubmitButton />
      </div>
    </form>
  );
}
