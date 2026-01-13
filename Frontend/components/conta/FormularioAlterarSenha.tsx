"use client";

import { useActionState, useEffect, useRef } from "react";
import { alterarSenha, EstadoAcao } from "@/lib/acoes";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
    >
      {pending ? "Alterando..." : "Alterar Senha"}
    </button>
  );
}

export function FormularioAlterarSenha() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token")
      : null;

  const estadoInicial: EstadoAcao = { mensagem: null, erros: {} };
  const [estado, dispatch] = useActionState(alterarSenha, estadoInicial);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.mensagem) {
      if (estado.mensagem.includes("sucesso")) {
        toast.success(estado.mensagem);
        formRef.current?.reset();
      }
    }
  }, [estado]);

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Alterar Senha</h2>
      <form ref={formRef} action={dispatch} className="space-y-4">
        <input type="hidden" name="token" value={token || ""} />
        <div>
          <label htmlFor="senhaAtual" className="block text-sm font-medium text-gray-700">
            Senha Atual
          </label>
          <input
            id="senhaAtual"
            name="senhaAtual"
            type="password"
            placeholder="••••••"
            required
            minLength={6}
            className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
          {estado.erros?.senhaAtual && <p className="text-sm text-red-500 mt-1">{estado.erros.senhaAtual[0]}</p>}
        </div>

        <div>
          <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700">
            Nova Senha
          </label>
          <input
            id="novaSenha"
            name="novaSenha"
            type="password"
            placeholder="••••••"
            required
            minLength={6}
            className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
          {estado.erros?.novaSenha && <p className="text-sm text-red-500 mt-1">{estado.erros.novaSenha[0]}</p>}
        </div>

        <div>
          <label htmlFor="confirmacaoNovaSenha" className="block text-sm font-medium text-gray-700">
            Confirmar Nova Senha
          </label>
          <input
            id="confirmacaoNovaSenha"
            name="confirmacaoNovaSenha"
            type="password"
            placeholder="••••••"
            required
            minLength={6}
            className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
          {estado.erros?.confirmacaoNovaSenha && (
            <p className="text-sm text-red-500 mt-1">{estado.erros.confirmacaoNovaSenha[0]}</p>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
