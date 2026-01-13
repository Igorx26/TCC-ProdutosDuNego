"use client";

import { useAuth } from "@/contexts/ContextoAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CarregandoSpinner = () => (
  <div className="flex justify-center items-center h-screen w-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
  </div>
);

export function LayoutAdminProtegido({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver carregando e o usuário não existir ou não for admin, redireciona
    if (!carregando && (!usuario || !usuario.admin)) {
      router.push("/login");
    }
  }, [usuario, carregando, router]);

  // Enquanto carrega a informação do usuário, exibe um spinner
  if (carregando || !usuario?.admin) {
    return <CarregandoSpinner />;
  }

  // Se o usuário for admin, renderiza o conteúdo da página
  return <>{children}</>;
}
