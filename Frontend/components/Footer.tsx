"use client";

import { useState } from "react";
import { useCarrinho } from "@/contexts/ContextoCarrinho";
import { ModalCarrinho } from "./ModalCarrinho";
import Link from "next/link";

export function Footer() {
  const { totalItens } = useCarrinho();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <footer className="w-full bg-red-600 py-2 fixed bottom-0 z-40 flex items-center px-4">
        <div className="flex-1"></div>

        <div>
          <button
            className="flex items-center gap-2 text-white font-bold py-2 px-4 rounded-2xl shadow shadow-red-950 hover:bg-red-700 hover:scale-105 duration-500"
            onClick={() => setIsModalOpen(true)}
          >
            (<span id="cart-count">{totalItens}</span>) Veja meu carrinho
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 256 256">
              <path d="M222.1,65.31a8,8,0,0,0-6.75-3.31H62.59L57.34,32.39A16,16,0,0,0,41.74,20H24a8,8,0,0,0,0,16h17.74l31.54,126.17A16,16,0,0,0,88.88,176H208a16,16,0,0,0,15.74-13.14l12-64A8,8,0,0,0,222.1,65.31ZM92,160l-16-64H210.39l-9.1,48.54Z"></path>
              <circle cx="96" cy="208" r="16"></circle>
              <circle cx="200" cy="208" r="16"></circle>
            </svg>
          </button>
        </div>

        <div className="flex-1 flex justify-end">
          <Link
            href="#home"
            aria-label="Voltar ao topo"
            className="text-white font-bold p-2 rounded-full hover:bg-red-700 hover:scale-110 duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 256 256">
              <path d="M222.63,166.63l-88-88a8,8,0,0,0-11.32,0l-88,88a8,8,0,0,0,11.32,11.32L128,97.31l83.31,83.32a8,8,0,0,0,11.32-11.32Z"></path>
            </svg>
          </Link>
        </div>
      </footer>
      {isModalOpen && <ModalCarrinho onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
