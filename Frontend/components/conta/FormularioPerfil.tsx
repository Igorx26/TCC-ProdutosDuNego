"use client";

import { useActionState, useState, useEffect } from "react";
import { Usuario } from "@/lib/definicoes";
import { editarPerfil, EstadoAcao } from "@/lib/acoes";
import { useFormStatus } from "react-dom";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";
import { useAuth } from "@/contexts/ContextoAuth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
    >
      {pending ? "Salvando..." : "Salvar Alterações"}
    </button>
  );
}

interface FormularioPerfilProps {
  usuario: Usuario;
}

export function FormularioPerfil({ usuario }: FormularioPerfilProps) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token")
      : null;

  const { recarregarUsuario } = useAuth();

  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const [estado, dispatch] = useActionState(editarPerfil, estadoInicial);

  const [celular, setCelular] = useState(usuario.celular || "");

  useEffect(() => {
    if (usuario) {
      setCelular(usuario.celular || "");
    }
  }, [usuario]);

  useEffect(() => {
    if (estado.mensagem) {
      if (estado.mensagem.includes("sucesso")) {
        toast.success(estado.mensagem);
        recarregarUsuario();
      }
    }
  }, [estado, recarregarUsuario]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Dados Pessoais</h2>
      <form action={dispatch} className="space-y-4">
        <input type="hidden" name="token" value={token || ""} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome*:
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              defaultValue={usuario.nome}
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
            {estado.erros?.nome && <p className="text-sm text-red-500 mt-1">{estado.erros.nome[0]}</p>}
          </div>
          <div>
            <label htmlFor="sobrenome" className="block text-sm font-medium text-gray-700">
              Sobrenome*:
            </label>
            <input
              type="text"
              id="sobrenome"
              name="sobrenome"
              defaultValue={usuario.sobrenome}
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
            {estado.erros?.sobrenome && <p className="text-sm text-red-500 mt-1">{estado.erros.sobrenome[0]}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="nomeUsuario" className="block text-sm font-medium text-gray-700">
            Nome de Usuário:
          </label>
          <input
            type="text"
            id="nomeUsuario"
            name="nomeUsuario"
            defaultValue={usuario.nomeUsuario}
            disabled
            className="relative block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="celular" className="block text-sm font-medium text-gray-700">
            Celular*:
          </label>
          <IMaskInput
            mask="(00) 00000-0000"
            type="tel"
            id="celular"
            name="celular"
            required
            className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            value={celular}
            onAccept={setCelular}
          />
          {estado.erros?.celular && <p className="text-sm text-red-500 mt-1">{estado.erros.celular[0]}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-mail:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={usuario.email || ""}
            className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
          {estado.erros?.email && <p className="text-sm text-red-500 mt-1">{estado.erros.email[0]}</p>}
        </div>

        <div className="pt-4 flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
