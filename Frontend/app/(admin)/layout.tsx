"use client";

import { useState } from "react";
import { BarraLateral } from "@/components/admin/BarraLateral";
import { CabecalhoAdmin } from "@/components/admin/CabecalhoAdmin";
import { AutenticacaoProvider } from "@/contexts/ContextoAuth";
import { LayoutAdminProtegido } from "./LayoutAdminProtegido";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "../globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const [sidebarAberta, setSidebarAberta] = useState(false);

  return (
    <html lang="pt-BR" className={poppins.className}>
      <body>
        <AutenticacaoProvider>
          <LayoutAdminProtegido>
            <div className="flex h-screen bg-[#f0f3fd]">
              <BarraLateral aberta={sidebarAberta} setAberta={setSidebarAberta} />
              <div className="flex-1 flex flex-col">
                <CabecalhoAdmin setSidebarAberta={setSidebarAberta} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
              </div>
            </div>
            <Toaster richColors position="top-right" />
          </LayoutAdminProtegido>
        </AutenticacaoProvider>
      </body>
    </html>
  );
}
