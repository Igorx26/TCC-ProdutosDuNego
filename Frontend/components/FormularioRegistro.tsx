"use client";

import { useActionState, useState } from "react";
import { registrarUsuario, EstadoAcao } from "@/lib/acoes";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";

export function FormularioRegistro() {
  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const [estado, dispatch] = useActionState(registrarUsuario, estadoInicial);

  // Estados para os campos controlados
  const [celular, setCelular] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");

  const [logradouro, setLogradouro] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);

  const handleMascaraChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
    setter(value);
  };

  const buscarEnderecoPorCep = async (cepValue: string) => {
    const cepLimpo = cepValue.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      return;
    }
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
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-900">Criar Nova Conta</h2>
      <form action={dispatch} className="mt-8 space-y-6">
        {/* --- DADOS PESSOAIS --- */}
        <fieldset className="space-y-4 mb-8">
          <legend className="px-2 font-semibold text-lg">Dados Pessoais</legend>
          <div className="text-sm text-red-600">* Campos obrigatórios</div>
          <div>
            <input
              name="nomeUsuario"
              type="text"
              placeholder="Nome de Usuário*"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
            {estado.erros?.nomeUsuario && <p className="text-sm text-red-500 mt-1">{estado.erros.nomeUsuario[0]}</p>}
          </div>
          <div>
            <input
              name="senha"
              type="password"
              placeholder="Senha* (mínimo 6 caracteres)"
              required
              minLength={6}
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
            {estado.erros?.senha && <p className="text-sm text-red-500 mt-1">{estado.erros.senha[0]}</p>}
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <input
                name="nome"
                type="text"
                placeholder="Nome*"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
              {estado.erros?.nome && <p className="text-sm text-red-500 mt-1">{estado.erros.nome[0]}</p>}
            </div>
            <div className="w-1/2">
              <input
                name="sobrenome"
                type="text"
                placeholder="Sobrenome*"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
              {estado.erros?.sobrenome && <p className="text-sm text-red-500 mt-1">{estado.erros.sobrenome[0]}</p>}
            </div>
          </div>
          <div>
            <IMaskInput
              mask="(00) 00000-0000"
              name="celular"
              id="celular"
              type="tel"
              placeholder="Celular*"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              value={celular}
              onAccept={handleMascaraChange(setCelular)}
            />
            {estado.erros?.["usuario.celular"] && (
              <p className="text-sm text-red-500 mt-1">{estado.erros["usuario.celular"][0]}</p>
            )}
          </div>
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email (opcional)"
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
            {estado.erros?.email && <p className="text-sm text-red-500 mt-1">{estado.erros.email[0]}</p>}
          </div>
          <div>
            <IMaskInput
              mask="000.000.000-00"
              id="cpf"
              name="cpf"
              type="text"
              placeholder="CPF*"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              value={cpf}
              onAccept={handleMascaraChange(setCpf)}
            />
            {estado.erros?.cpf && <p className="text-sm text-red-500 mt-1">{estado.erros.cpf[0]}</p>}
          </div>
          <div>
            <label htmlFor="dataNascimento" className="text-sm text-gray-500">
              Data de Nascimento (opcional)
            </label>
            <input
              id="dataNascimento"
              name="dataNascimento"
              type="date"
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
            {estado.erros?.dataNascimento && (
              <p className="text-sm text-red-500 mt-1">{estado.erros.dataNascimento[0]}</p>
            )}
          </div>
        </fieldset>

        <div className="border-t border-gray-200"></div>

        {/* --- ENDEREÇO --- */}
        <fieldset className="space-y-4">
          <legend className="px-2 font-semibold text-lg">Endereço Principal</legend>
          <div>
            <IMaskInput
              mask="00000-000"
              name="cep"
              id="cep"
              type="text"
              placeholder="Digite seu CEP*"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              value={cep}
              onAccept={handleMascaraChange(setCep)}
              onBlur={(e) => buscarEnderecoPorCep(e.target.value)}
              disabled={buscandoCep}
            />
            {buscandoCep && <p className="text-sm text-gray-500 mt-1">Buscando CEP...</p>}
            {estado.erros?.["endereco.cep"] && (
              <p className="text-sm text-red-500 mt-1">{estado.erros["endereco.cep"][0]}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="w-3/4">
              <input
                name="logradouro"
                id="logradouro"
                type="text"
                placeholder="Logradouro*"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
              />
              {estado.erros?.["endereco.logradouro"] && (
                <p className="text-sm text-red-500 mt-1">{estado.erros["endereco.logradouro"][0]}</p>
              )}
            </div>
            <div className="w-1/4">
              <input
                name="numero"
                id="numero"
                type="text"
                placeholder="Número*"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
              {estado.erros?.["endereco.numero"] && (
                <p className="text-sm text-red-500 mt-1">{estado.erros["endereco.numero"][0]}</p>
              )}
            </div>
          </div>

          <div>
            <input
              name="complemento"
              id="complemento"
              type="text"
              placeholder="Complemento (opcional)"
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <input
                name="bairro"
                id="bairro"
                type="text"
                placeholder="Bairro*"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
              {estado.erros?.["endereco.bairro"] && (
                <p className="text-sm text-red-500 mt-1">{estado.erros["endereco.bairro"][0]}</p>
              )}
            </div>
            <div className="w-1/3">
              <input
                name="cidade"
                id="cidade"
                type="text"
                placeholder="Cidade*"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
              {estado.erros?.["endereco.cidade"] && (
                <p className="text-sm text-red-500 mt-1">{estado.erros["endereco.cidade"][0]}</p>
              )}
            </div>
            <div className="w-1/6">
              <input
                name="uf"
                id="uf"
                type="text"
                placeholder="UF*"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                maxLength={2}
                value={uf}
                onChange={(e) => setUf(e.target.value)}
              />
              {estado.erros?.["endereco.uf"] && (
                <p className="text-sm text-red-500 mt-1">{estado.erros["endereco.uf"][0]}</p>
              )}
            </div>
          </div>
        </fieldset>

        {estado.mensagem && <p className="text-sm text-center text-red-500">{estado.mensagem}</p>}

        <div>
          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Cadastrar
          </button>
        </div>
      </form>
    </div>
  );
}
