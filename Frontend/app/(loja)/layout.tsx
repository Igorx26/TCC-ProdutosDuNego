import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { CarrinhoProvider } from "@/contexts/ContextoCarrinho";
import { AutenticacaoProvider } from "@/contexts/ContextoAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "../globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Produtos Du Nego",
  description: "Os melhores produtos da roça da região.",
};

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={poppins.className}>
      <body>
        <AutenticacaoProvider>
          <CarrinhoProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <Toaster richColors position="top-right" />
          </CarrinhoProvider>
        </AutenticacaoProvider>
      </body>
    </html>
  );
}
