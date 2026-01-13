"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { useDebouncedCallback } from "use-debounce";

export function CampoDeBusca({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // A função de busca é envolvida por 'useDebouncedCallback'
  // Ela só será executada 300ms após o usuário parar de digitar
  const handleBusca = useDebouncedCallback((termo: string) => {
    const params = new URLSearchParams(searchParams);

    // Reseta para a primeira página sempre que uma nova busca é feita
    params.set("page", "1");

    if (termo) {
      params.set("busca", termo);
    } else {
      params.delete("busca");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative w-full sm:w-1/3 mb-4">
      <label htmlFor="search" className="sr-only">
        Buscar
      </label>
      <input
        className="w-full rounded-md border border-gray-300 py-2 pl-10 text-sm outline-1 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleBusca(e.target.value);
        }}
        // Garante que o campo reflita o parâmetro da URL ao carregar a página
        defaultValue={searchParams.get("busca")?.toString()}
      />
      <FiSearch className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
