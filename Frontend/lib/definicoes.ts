// lib/definicoes.ts

// Corresponde à tabela 'Usuario'
export type Usuario = {
  id: number;
  nomeUsuario: string;
  senha?: string;
  cpf?: string | null;
  nome: string;
  sobrenome: string;
  dataNascimento?: string | null;
  celular: string;
  email?: string | null;
  dataCadastro: string;
  ultimoLogin: string;
  ativo: boolean;
  admin: boolean;
};

// Corresponde à tabela 'Endereco'
export type Endereco = {
  id: number;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  isPrincipal: boolean;
};

// Corresponde à tabela 'UsuarioEndereco' (Tabela de ligação)
export type UsuarioEndereco = {
  id: number;
  principal: boolean;
  ativo: boolean;
  idUsuario: number;
  idEndereco: number;
};

// Corresponde à tabela 'Categoria'
export type Categoria = {
  id: number;
  nome: string;
  descricao?: string | null;
  ativo: boolean;
};

// Corresponde à tabela 'Medida'
export type Medida = {
  id: number;
  nome: string;
  ativo: boolean;
};

// Corresponde à tabela 'Produto'
export type Produto = {
  id: number;
  nome: string;
  descricao?: string | null;
  observacao?: string | null;
  valor: number;
  estoque: number;
  imagem?: string | null;
  dataCadastro: string;
  ativo: boolean;
  idCategoria: number;
  idMedida: number;
};

// Tipo para o item dentro do carrinho de compras (frontend)
export type ItemCarrinho = Produto & {
  quantidade: number;
};

// Corresponde à tabela 'Fornecedor'
export type Fornecedor = {
  id: number;
  empresa?: string | null;
  cnpj?: string | null;
  telefoneEmpresa?: string | null;
  nomeVendedor: string;
  celularVendedor: string;
  email?: string | null;
  ativo: boolean;
};

// Corresponde à tabela 'Status'
export type Status = {
  id: number;
  descricao: string;
  ativo: boolean;
};

// Corresponde à tabela 'FormaPagamento'
export type FormaPagamento = {
  id: number;
  descricao: string;
  ativo: boolean;
};

// Corresponde à tabela 'Venda'
export type Venda = {
  id: number;
  dataHora?: string | null;
  entrega?: boolean;
  totalBruto?: number;
  desconto?: number;
  observacaoDesconto?: string | null;
  acrescimo?: number;
  observacaoAcrescimo?: string | null;
  totalLiquido?: number;
  dataParaEntrega?: string | null;
  horaParaEntrega?: string | null;
  observacaoCliente?: string | null;
  dataHoraDaEntrega?: string | null;
  dataHoraPagamento?: string | null;
  idStatus: number;
  idFornecedor?: number | null;
  idUsuarioEndereco?: number | null;
  nomeCliente: string;
  descricaoStatus: string;
  endereco?: Endereco | null;
  itens?: VendaItem[];
  formaPagamento?: FormaPagamento | null;
};

// Corresponde ao VendaItemResponseDTO do backend
export type VendaItem = {
  idProduto: number;
  nomeProduto: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
};

// Corresponde à tabela 'CompraItem'
export type CompraItem = {
  id: number;
  valor: number;
  quantidade: number;
  total: number;
  data: string;
  idProduto: number;
  idFornecedor: number;
};

export type ProdutoEnriquecido = Produto & {
  nomeCategoria: string;
};

export type CompraItemEnriquecido = CompraItem & {
  nomeProduto: string;
  nomeVendedor: string;
};
