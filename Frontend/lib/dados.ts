import {
  Categoria,
  CompraItem,
  CompraItemEnriquecido,
  Endereco,
  FormaPagamento,
  Fornecedor,
  Medida,
  Produto,
  Status,
  Usuario,
  Venda,
} from "./definicoes";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

// --- FUNÇÕES DE AUTENTICAÇÃO E FETCH DO LADO DO CLIENTE ---

function getTokenFromLocalStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getAuthHeader(): HeadersInit {
  const token = getTokenFromLocalStorage();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function buscarDados<T>(endpoint: string, nomeDaEntidade: string): Promise<T[]> {
  try {
    const headers = getAuthHeader();
    const res = await fetch(`${baseUrl}/${endpoint}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Falha ao buscar ${nomeDaEntidade}: Status ${res.status}. Resposta: ${errorBody}`);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error(`Erro de conexão ao buscar ${nomeDaEntidade}:`, error);
    return [];
  }
}

async function buscarDadosPorId<T>(endpoint: string, id: number, nomeDaEntidade: string): Promise<T | null> {
  try {
    const headers = getAuthHeader();
    const res = await fetch(`${baseUrl}/${endpoint}/obterPorId/${id}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      const errorBody = await res.text();
      console.error(`Falha ao buscar ${nomeDaEntidade} com ID ${id}: Status ${res.status}. Resposta: ${errorBody}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error(`Erro de conexão ao buscar ${nomeDaEntidade} com ID ${id}:`, error);
    return null;
  }
}

// --- FUNÇÕES DE BUSCA DE LISTAS ---

export async function buscarProdutos(): Promise<Produto[]> {
  return buscarDados<Produto>("produto/obterTodos", "produtos");
}

export async function buscarCategorias(): Promise<Categoria[]> {
  return buscarDados<Categoria>("categoria/obterTodos", "categorias");
}

export async function buscarMedidas(): Promise<Medida[]> {
  return buscarDados<Medida>("medida/obterTodos", "medidas");
}

export async function buscarUsuarios(): Promise<Usuario[]> {
  return buscarDados<Usuario>("usuario/obterTodos", "usuários");
}

export async function buscarVendas(): Promise<Venda[]> {
  return buscarDados<Venda>("venda/obterTodas", "vendas");
}

export async function buscarMeusPedidos(): Promise<Venda[]> {
  return buscarDados<Venda>("venda/meus-pedidos", "meus pedidos");
}

export async function buscarCompras(): Promise<CompraItem[]> {
  return buscarDados<CompraItem>("compra/obterTodas", "compras");
}

export async function buscarFornecedores(): Promise<Fornecedor[]> {
  return buscarDados<Fornecedor>("fornecedor/obterTodos", "fornecedores");
}

export async function buscarStatus(): Promise<Status[]> {
  return buscarDados<Status>("status/obterTodos", "status");
}

export async function buscarFormasPagamento(): Promise<FormaPagamento[]> {
  return buscarDados<FormaPagamento>("formaPagamento/obterTodos", "formas de pagamento");
}

export async function buscarClientes(): Promise<Usuario[]> {
  const usuarios = await buscarUsuarios();
  return usuarios.filter((u) => !u.admin && u.ativo);
}

// --- FUNÇÕES DE BUSCA POR ID ---

export async function buscarProdutoPorId(id: number): Promise<Produto | null> {
  return buscarDadosPorId<Produto>("produto", id, "produto");
}

export async function buscarCategoriaPorId(id: number): Promise<Categoria | null> {
  return buscarDadosPorId<Categoria>("categoria", id, "categoria");
}

export async function buscarMedidaPorId(id: number): Promise<Medida | null> {
  return buscarDadosPorId<Medida>("medida", id, "medida");
}

export async function buscarFormaPagamentoPorId(id: number): Promise<FormaPagamento | null> {
  return buscarDadosPorId<FormaPagamento>("formaPagamento", id, "forma de pagamento");
}

export async function buscarFornecedorPorId(id: number): Promise<Fornecedor | null> {
  return buscarDadosPorId<Fornecedor>("fornecedor", id, "fornecedor");
}

export async function buscarVendaPorId(id: number): Promise<Venda | undefined> {
  const vendas = await buscarVendas();
  return vendas.find((v) => v.id === id);
}

export async function buscarVendaCompletaPorId(vendaId: number): Promise<Venda | null> {
  try {
    const todasAsVendas = await buscarVendas();
    const venda = todasAsVendas.find((v) => v.id === vendaId);
    return venda || null;
  } catch (error) {
    console.error(`Falha ao buscar detalhes completos da venda ${vendaId}:`, error);
    return null;
  }
}

export async function buscarMeusEnderecos(): Promise<Endereco[]> {
  return buscarDados<Endereco>("meus-enderecos", "meus endereços");
}

export async function buscarEnderecosPorUsuarioId(usuarioId: number): Promise<Endereco[]> {
  if (!usuarioId) return [];
  return buscarDados<Endereco>(`usuarios/${usuarioId}/enderecos`, "endereços do usuário");
}

// --- FUNÇÕES COM LÓGICA COMPLEXA ---

export async function buscarComprasPaginadas(pagina: number, busca: string = "") {
  const itensPorPagina = 10;

  const [todasAsCompras, todosOsProdutos, todosOsFornecedores] = await Promise.all([
    buscarCompras(),
    buscarProdutos(),
    buscarFornecedores(),
  ]);

  const mapaProdutos = new Map(todosOsProdutos.map((p) => [p.id, p.nome]));
  const mapaFornecedores = new Map(todosOsFornecedores.map((f) => [f.id, f.nomeVendedor]));

  const comprasEnriquecidas: CompraItemEnriquecido[] = todasAsCompras.map((compra) => ({
    ...compra,
    nomeProduto: mapaProdutos.get(compra.idProduto) || "Produto desconhecido",
    nomeVendedor: mapaFornecedores.get(compra.idFornecedor) || "Vendedor desconhecido",
  }));

  const buscaLower = busca.toLowerCase();
  const comprasFiltradas = buscaLower
    ? comprasEnriquecidas.filter(
        (compra) =>
          compra.nomeProduto.toLowerCase().includes(buscaLower) ||
          compra.nomeVendedor.toLowerCase().includes(buscaLower)
      )
    : comprasEnriquecidas;

  const totalPaginas = Math.ceil(comprasFiltradas.length / itensPorPagina);
  const inicio = (pagina - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const itensDaPagina = comprasFiltradas.slice(inicio, fim);

  return {
    itens: itensDaPagina,
    totalPaginas,
  };
}
