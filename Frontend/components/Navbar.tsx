"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DisplayAutenticacao } from "./DisplayAutenticacao";
import { usePathname } from "next/navigation";

const navLinks = [
  { id: "home", path: "/#home", label: "Início" },
  { id: "queijos-e-derivados", path: "/#queijos-e-derivados", label: "Queijos e Derivados" },
  { id: "linguiças", path: "/#linguiças", label: "Linguiças" },
  { id: "massas", path: "/#massas", label: "Massas" },
  { id: "outros", path: "/#outros", label: "Outros" },
  { id: "bebidas", path: "/#bebidas", label: "Bebidas" },
];

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256">
    <path d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128ZM40,84H216a12,12,0,0,0,0-24H40a12,12,0,0,0,0,24Zm176,88H40a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Z"></path>
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256">
    <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path>
  </svg>
);

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (pathname !== "/") return;

      const sections = navLinks.map((link) => document.getElementById(link.id));
      const scrollPosition = window.scrollY + 150;

      let currentSection = "home";
      for (const section of sections) {
        if (
          section &&
          scrollPosition >= section.offsetTop &&
          scrollPosition < section.offsetTop + section.offsetHeight
        ) {
          currentSection = section.id;
          break;
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <header className="z-40 fixed top-0 w-full bg-[#f0f3fd] border-b border-zinc-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative flex items-center justify-between h-14">
          {/* Lado Esquerdo: Título (visível apenas no mobile) */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold md:hidden">
              Produtos Du Nego
            </Link>
          </div>

          {/* Layout para telas MÉDIAS (md até lg) - Links e Auth juntos à direita */}
          <div className="hidden md:flex lg:hidden flex-1 justify-end">
            <nav className="flex items-center space-x-4 text-base font-bold">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.path}
                  className={`whitespace-nowrap hover:text-red-600 transition-all duration-300 ${
                    activeSection === link.id && pathname === "/" ? "destaque" : "hover:scale-105"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pl-2">
                <DisplayAutenticacao />
              </div>
            </nav>
          </div>

          {/* Layout para telas LARGAS (lg em diante) - Links no centro, Auth à direita */}
          <div className="hidden lg:flex flex-1 justify-center">
            <nav className="flex items-center space-x-6 text-[1.1rem] font-bold">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.path}
                  className={`whitespace-nowrap hover:text-red-600 transition-all duration-300 ${
                    activeSection === link.id && pathname === "/" ? "destaque" : "hover:scale-105"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="hidden lg:flex flex-shrink-0">
            <DisplayAutenticacao />
          </div>

          {/* Lado Direito (Mobile): Auth e Menu Hambúrguer */}
          <div className="md:hidden flex items-center gap-4">
            <DisplayAutenticacao />
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Abrir menu" aria-expanded={isMenuOpen}>
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="md:hidden bg-[#f0f3fd] shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-white hover:bg-red-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
