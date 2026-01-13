// app/(loja)/login/page.tsx
"use client";

import { useState } from "react";
import { FormularioLogin } from "@/components/FormularioLogin";
import { FormularioRegistro } from "@/components/FormularioRegistro";

export default function LoginPage() {
  // Estado para controlar qual formulário é exibido: 'login' ou 'registrar'
  const [view, setView] = useState("login");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0f3fd] pt-20 pb-12">
      <div className="w-full max-w-md mb-8 p-8 space-y-8 bg-white rounded-lg shadow-md">
        {view === "login" ? (
          <>
            <FormularioLogin />
            <p className="text-center text-sm text-gray-600">
              Não tem uma conta?{" "}
              <button onClick={() => setView("registrar")} className="font-medium text-red-600 hover:underline">
                Cadastre-se
              </button>
            </p>
          </>
        ) : (
          <>
            <FormularioRegistro />
            <p className="text-center text-sm text-gray-600">
              Já tem uma conta?{" "}
              <button onClick={() => setView("login")} className="font-medium text-red-600 hover:underline">
                Faça login
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
