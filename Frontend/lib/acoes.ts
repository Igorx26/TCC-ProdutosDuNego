"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export type EstadoAcao = {
  erros?: Record<string, string[] | undefined>;
  mensagem?: string | null;
};

// --- SCHEMAS DE VALIDAÇÃO ---

const EsquemaRegistroUsuario = z.object({
  nomeUsuario: z.string().min(3, "O nome de usuário deve ter no mínimo 3 caracteres."),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  nome: z.string().min(2, "O nome é obrigatório."),
  sobrenome: z.string().min(2, "O sobrenome é obrigatório."),
  celular: z.string().length(11, "O celular deve ter 11 dígitos."),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
  cpf: z.string().length(11, "O CPF deve ter 11 dígitos.").nullable(),
  dataNascimento: z.string().optional().nullable(),
});

const EsquemaEndereco = z.object({
  cep: z.string().length(8, "CEP deve ter 8 dígitos."),
  logradouro: z.string().min(1, "Logradouro é obrigatório."),
  numero: z.string().min(1, "Número é obrigatório."),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório."),
  cidade: z.string().min(1, "Cidade é obrigatória."),
  uf: z.string().length(2, "UF deve ter 2 caracteres."),
  isPrincipal: z.coerce.boolean().optional(),
});

const EsquemaRegistroCompleto = z.object({
  usuario: EsquemaRegistroUsuario,
  endereco: EsquemaEndereco,
});

const EsquemaProduto = z.object({
  id: z.coerce.number().optional(),
  nome: z.string().min(3, { message: "O nome deve ter no mínimo 3 caracteres." }),
  descricao: z.string().optional().nullable(),
  observacao: z.string().optional().nullable(),
  valor: z.coerce.number().gt(0, { message: "O valor deve ser maior que zero." }),
  estoque: z.coerce.number().int().gte(0, { message: "O estoque não pode ser negativo." }),
  imagem: z.string().optional(),
  dataCadastro: z.string().optional(),
  ativo: z.coerce.boolean(),
  idCategoria: z.coerce
    .number({ required_error: "Por favor, selecione uma categoria." })
    .gt(0, { message: "Por favor, selecione uma categoria." }),
  idMedida: z.coerce
    .number({ required_error: "Por favor, selecione uma medida." })
    .gt(0, { message: "Por favor, selecione uma medida." }),
});

const EsquemaCategoria = z.object({
  id: z.coerce.number().optional(),
  nome: z.string().min(3, { message: "O nome da categoria deve ter no mínimo 3 caracteres." }),
  descricao: z.string().optional().nullable(),
  ativo: z.coerce.boolean(),
});

const EsquemaMedida = z.object({
  id: z.coerce.number().optional(),
  nome: z.string().min(1, { message: "O nome da medida deve ter no mínimo 1 caracteres." }),
  ativo: z.coerce.boolean(),
});

const EsquemaFormaPagamento = z.object({
  id: z.coerce.number().optional(),
  descricao: z.string().min(3, { message: "A descrição deve ter no mínimo 3 caracteres." }),
  ativo: z.coerce.boolean(),
});

const EsquemaFornecedor = z.object({
  id: z.coerce.number().optional(),
  empresa: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  telefoneEmpresa: z.string().optional().nullable(),
  nomeVendedor: z.string().min(3, { message: "O nome do vendedor é obrigatório." }),
  celularVendedor: z
    .string({ required_error: "O número de celular é obrigatório." })
    .transform((cel) => cel.replace(/[^\d]/g, ""))
    .refine((cel) => cel.length === 11, {
      message: "O celular deve ter 11 dígitos (incluindo o DDD).",
    }),
  email: z.string().email({ message: "Por favor, insira um email válido." }).optional().or(z.literal("")),
  ativo: z.coerce.boolean(),
});

const EsquemaItemCompra = z.object({
  id: z.coerce.number().gt(0, { message: "Produto inválido." }), // id do Produto
  quantidade: z.coerce.number().gt(0, { message: "A quantidade deve ser maior que zero." }),
  valor: z.coerce.number().gt(0, { message: "O valor do item deve ser maior que zero." }),
});

const EsquemaVendaItem = z.object({
  idProduto: z.coerce.number().gt(0, { message: "Produto inválido." }),
  quantidade: z.coerce.number().gt(0, { message: "Quantidade deve ser maior que 0." }),
  valor: z.coerce.number().gt(0, { message: "Valor inválido." }),
});

// Schema para o formulário de atualização de perfil
const EsquemaPerfil = z.object({
  nome: z.string().min(2, "O nome é obrigatório."),
  sobrenome: z.string().min(2, "O sobrenome é obrigatório."),
  celular: z.string().length(11, "O celular deve ter 11 dígitos."),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
});

// Schema para o formulário de alteração de senha
const EsquemaAlterarSenha = z
  .object({
    senhaAtual: z.string().min(6, "A senha atual é necessária."),
    novaSenha: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres."),
    confirmacaoNovaSenha: z.string().min(6, "A confirmação da senha é necessária."),
  })
  .refine((data) => data.novaSenha === data.confirmacaoNovaSenha, {
    message: "A nova senha e a confirmação não correspondem.",
    path: ["confirmacaoNovaSenha"],
  });

// --- AÇÃO DE REGISTRO DE USUÁRIO ---
export async function registrarUsuario(prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const dadosDoFormulario = Object.fromEntries(formData.entries());

  // Limpeza dos dados com máscara
  const celularLimpo = (dadosDoFormulario.celular as string)?.replace(/\D/g, "");
  const cpfLimpo = (dadosDoFormulario.cpf as string)?.replace(/\D/g, "");
  const cepLimpo = (dadosDoFormulario.cep as string)?.replace(/\D/g, "");

  // Monta o objeto aninhado para validação
  const payload = {
    usuario: {
      nomeUsuario: dadosDoFormulario.nomeUsuario,
      senha: dadosDoFormulario.senha,
      nome: dadosDoFormulario.nome,
      sobrenome: dadosDoFormulario.sobrenome,
      celular: celularLimpo,
      cpf: cpfLimpo,
      email: dadosDoFormulario.email,
      dataNascimento: dadosDoFormulario.dataNascimento,
    },
    endereco: {
      cep: cepLimpo,
      logradouro: dadosDoFormulario.logradouro,
      numero: dadosDoFormulario.numero,
      complemento: dadosDoFormulario.complemento,
      bairro: dadosDoFormulario.bairro,
      cidade: dadosDoFormulario.cidade,
      uf: dadosDoFormulario.uf,
    },
  };

  const dadosValidados = EsquemaRegistroCompleto.safeParse(payload);

  if (!dadosValidados.success) {
    return {
      erros: dadosValidados.error.flatten().fieldErrors as any,
      mensagem: "Falha na validação. Verifique os campos e tente novamente.",
    };
  }

  try {
    const response = await fetch(`${baseUrl}/usuario/salvarComEndereco`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosValidados.data),
    });

    if (!response.ok) {
      const erroBody = await response.json().catch(() => ({ message: "Erro desconhecido." }));
      return { mensagem: `Falha no cadastro: ${erroBody.message}` };
    }
  } catch (error) {
    console.error("Erro de conexão ao registrar usuário:", error);
    return { mensagem: "Não foi possível conectar ao servidor." };
  }

  revalidatePath("/login");
  redirect("/login?cadastro=sucesso");
}

// --- AÇÕES DE PRODUTOS ---

export async function adicionarProduto(prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Ação não autorizada. Faça login novamente." };
  }

  const imagemFile = formData.get("imagem") as File;
  let imagemBase64: string | null = null;

  if (imagemFile && imagemFile.size > 0) {
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (!ALLOWED_IMAGE_TYPES.includes(imagemFile.type)) {
      return { mensagem: "Formato de imagem inválido. Apenas JPG/JPEG, PNG e WebP são permitidos." };
    }

    if (imagemFile.size > MAX_FILE_SIZE) {
      return { mensagem: "A imagem é muito grande. O tamanho máximo permitido é 4MB." };
    }

    try {
      const bytes = await imagemFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imagemBase64 = `data:${imagemFile.type};base64,${buffer.toString("base64")}`;
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      return { mensagem: "Falha ao ler o arquivo da imagem." };
    }
  }

  const dadosParaValidar = {
    ...Object.fromEntries(formData.entries()),
    ativo: formData.get("ativo") === "on" || formData.get("ativo") === "true",
    imagem: imagemBase64 || undefined,
  };

  const dadosValidados = EsquemaProduto.safeParse(dadosParaValidar);

  if (!dadosValidados.success) {
    return {
      erros: dadosValidados.error.flatten().fieldErrors,
      mensagem: "Falha na validação. Verifique os campos.",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/produto/salvar`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(dadosValidados.data),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido." }));
      return { mensagem: `Erro do servidor: ${erroBody.message || res.statusText}` };
    }
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    return { mensagem: "Erro de rede: Falha ao conectar com o servidor." };
  }

  revalidatePath("/produtos");
  redirect("/produtos");
}

export async function editarProduto(id: number, prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Ação não autorizada. Faça login novamente." };
  }

  const novaImagemFile = formData.get("imagem") as File;
  let imagemParaApi: string | undefined = undefined;

  if (novaImagemFile && novaImagemFile.size > 0) {
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (!ALLOWED_IMAGE_TYPES.includes(novaImagemFile.type)) {
      return { mensagem: "Formato de imagem inválido. Apenas JPG/JPEG, PNG e WebP são permitidos." };
    }

    if (novaImagemFile.size > MAX_FILE_SIZE) {
      return { mensagem: "A imagem é muito grande. O tamanho máximo permitido é 4MB." };
    }

    try {
      const bytes = await novaImagemFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imagemParaApi = `data:${novaImagemFile.type};base64,${buffer.toString("base64")}`;
    } catch (error) {
      console.error("Erro ao processar nova imagem:", error);
      return { mensagem: "Falha ao ler o arquivo da nova imagem." };
    }
  }

  const dadosParaValidar = {
    ...Object.fromEntries(formData.entries()),
    ativo: formData.get("ativo") === "on" || formData.get("ativo") === "true",
    imagem: imagemParaApi,
  };

  const dadosValidados = EsquemaProduto.safeParse(dadosParaValidar);

  if (!dadosValidados.success) {
    return {
      erros: dadosValidados.error.flatten().fieldErrors,
      mensagem: "Falha na validação. Verifique os campos.",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/produto/atualizar/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(dadosValidados.data),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido." }));
      return { mensagem: `Erro do servidor: ${erroBody.message || res.statusText}` };
    }
  } catch (error) {
    console.error(`Erro ao editar produto ${id}:`, error);
    return { mensagem: "Erro de rede: Falha ao conectar com o servidor." };
  }

  revalidatePath("/produtos");
  revalidatePath(`/produtos/${id}/editar`);
  redirect("/produtos");
}

// --- AÇÕES DE CATEGORIAS ---

export async function adicionarCategoria(prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Erro de autenticação: Token não fornecido." };
  }

  const dadosValidados = EsquemaCategoria.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao"),
    ativo: formData.get("ativo") === "on" || formData.get("ativo") === "true",
  });

  if (!dadosValidados.success) {
    return {
      erros: dadosValidados.error.flatten().fieldErrors,
      mensagem: "Falha na validação. Verifique os campos.",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/categoria/salvar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dadosValidados.data),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido do servidor." }));
      console.error("Erro na resposta do servidor:", res.status, erroBody);
      return { mensagem: `Erro do servidor: ${erroBody.message || res.statusText}` };
    }
  } catch (error) {
    console.error("Erro ao adicionar categoria:", error);
    return { mensagem: "Erro de rede: Falha ao conectar com o servidor." };
  }

  revalidatePath("/categorias");
  redirect("/categorias");
}

export async function editarCategoria(id: number, prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Ação não autorizada. Faça login novamente." };
  }

  const dadosValidados = EsquemaCategoria.safeParse({
    id: id,
    nome: formData.get("nome"),
    descricao: formData.get("descricao"),
    ativo: formData.get("ativo") === "on" || formData.get("ativo") === "true",
  });

  if (!dadosValidados.success) {
    return {
      erros: dadosValidados.error.flatten().fieldErrors,
      mensagem: "Falha na validação. Verifique os campos.",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/categoria/atualizar/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dadosValidados.data),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido do servidor." }));
      console.error("Erro na resposta do servidor:", res.status, erroBody);
      return { mensagem: `Erro do servidor: ${erroBody.message || res.statusText}` };
    }
  } catch (error) {
    console.error("Erro ao editar categoria:", error);
    return { mensagem: "Erro de rede: Falha ao conectar com o servidor." };
  }

  revalidatePath("/categorias");
  revalidatePath(`/categorias/${id}/editar`);
  redirect("/categorias");
}

// --- AÇÕES DE MEDIDAS ---

export async function adicionarMedida(prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Ação não autorizada. Faça login novamente." };
  }

  const dadosValidados = EsquemaMedida.safeParse({
    nome: formData.get("nome"),
    ativo: formData.get("ativo") === "on" || formData.get("ativo") === "true",
  });

  if (!dadosValidados.success) {
    return {
      erros: dadosValidados.error.flatten().fieldErrors,
      mensagem: "Falha na validação. Verifique os campos.",
    };
  }

  console.log("Dados validados para criação de medida:", dadosValidados.data);

  try {
    const res = await fetch(`${baseUrl}/medida/salvar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dadosValidados.data),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido do servidor." }));
      return { mensagem: `Erro do servidor: ${erroBody.message || res.statusText}` };
    }
  } catch (error) {
    console.error("Erro ao adicionar medida:", error);
    return { mensagem: "Erro de rede: Falha ao conectar com o servidor." };
  }

  revalidatePath("/medidas");
  redirect("/medidas");
}

export async function editarMedida(id: number, prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Ação não autorizada. Faça login novamente." };
  }

  const dadosValidados = EsquemaMedida.safeParse({
    id: id,
    nome: formData.get("nome"),
    ativo: formData.get("ativo") === "on" || formData.get("ativo") === "true",
  });

  if (!dadosValidados.success) {
    return {
      erros: dadosValidados.error.flatten().fieldErrors,
      mensagem: "Falha na validação.",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/medida/atualizar/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dadosValidados.data),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido do servidor." }));
      return { mensagem: `Erro do servidor: ${erroBody.message || res.statusText}` };
    }
  } catch (error) {
    console.error(`Erro ao editar medida ${id}:`, error);
    return { mensagem: "Erro de rede: Falha ao conectar com o servidor." };
  }

  revalidatePath("/medidas");
  revalidatePath(`/medidas/${id}/editar`);
  redirect("/medidas");
}

// --- AÇÕES DE FORMAS DE PAGAMENTO ---

export async function adicionarFormaPagamento(prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Ação não autorizada. Faça login novamente." };
  }

  const dadosValidados = EsquemaFormaPagamento.safeParse({
    descricao: formData.get("descricao"),
    ativo: formData.get("ativo") === "on" || formData.get("ativo") === "true",
  });

  if (!dadosValidados.success) {
    return {
      erros: dadosValidados.error.flatten().fieldErrors,
      mensagem: "Falha na validação. Verifique os campos.",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/formaPagamento/salvar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dadosValidados.data),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido do servidor." }));
      return { mensagem: `Erro do servidor: ${erroBody.message || res.statusText}` };
    }
  } catch (error) {
    console.error("Erro ao adicionar forma de pagamento:", error);
    return { mensagem: "Erro de rede: Falha ao conectar com o servidor." };
  }

  revalidatePath("/formasPagamento");
  redirect("/formasPagamento");
}

export async function editarFormaPagamento(id: number, prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Ação não autorizada. Faça login novamente." };
  }

  const dadosValidados = EsquemaFormaPagamento.safeParse({
    id: id,
    descricao: formData.get("descricao"),
    ativo: formData.get("ativo") === "on" || formData.get("ativo") === "true",
  });

  if (!dadosValidados.success) {
    return {
      erros: dadosValidados.error.flatten().fieldErrors,
      mensagem: "Falha na validação. Verifique os campos.",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/formaPagamento/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dadosValidados.data),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido do servidor." }));
      return { mensagem: `Erro do servidor: ${erroBody.message || res.statusText}` };
    }
  } catch (error) {
    console.error(`Erro ao editar forma de pagamento ${id}:`, error);
    return { mensagem: "Erro de rede: Falha ao conectar com o servidor." };
  }

  revalidatePath("/formasPagamento");
  revalidatePath(`/formasPagamento/${id}/editar`);
  redirect("/formasPagamento");
}

// --- AÇÕES DE FORNECEDORES ---

export async function adicionarFornecedor(prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Ação não autorizada. Faça login novamente." };
  }

  const dadosValidados = EsquemaFornecedor.safeParse({
    ...Object.fromEntries(formData.entries()),
    ativo: formData.get("ativo") === "on" || formData.get("ativo") === "true",
  });

  if (!dadosValidados.success) {
    return {
      erros: dadosValidados.error.flatten().fieldErrors,
      mensagem: "Falha na validação. Verifique os campos.",
    };
  }

  console.log("Dados validados para criação de fornecedor:", dadosValidados.data);
  try {
    const res = await fetch(`${baseUrl}/fornecedor/salvar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dadosValidados.data),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido do servidor." }));
      return { mensagem: `Erro do servidor: ${erroBody.message || res.statusText}` };
    }
  } catch (error) {
    console.error("Erro ao adicionar fornecedor:", error);
    return { mensagem: "Erro de rede: Falha ao conectar com o servidor." };
  }

  revalidatePath("/fornecedores");
  redirect("/fornecedores");
}

export async function editarFornecedor(id: number, prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Ação não autorizada. Faça login novamente." };
  }

  const dadosValidados = EsquemaFornecedor.safeParse({
    ...Object.fromEntries(formData.entries()),
    id: id,
    ativo: formData.get("ativo") === "on" || formData.get("ativo") === "true",
  });

  if (!dadosValidados.success) {
    return {
      erros: dadosValidados.error.flatten().fieldErrors,
      mensagem: "Falha na validação. Verifique os campos.",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/fornecedor/atualizar/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dadosValidados.data),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido do servidor." }));
      return { mensagem: `Erro do servidor: ${erroBody.message || res.statusText}` };
    }
  } catch (error) {
    console.error(`Erro ao editar fornecedor ${id}:`, error);
    return { mensagem: "Erro de rede: Falha ao conectar com o servidor." };
  }

  revalidatePath("/fornecedores");
  revalidatePath(`/fornecedores/${id}/editar`);
  redirect("/fornecedores");
}

// --- AÇÕES DE COMPRAS ---

export async function registrarCompra(prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Ação não autorizada. Faça login novamente." };
  }

  const payloadString = formData.get("payload") as string;
  if (!payloadString) {
    return { mensagem: "Dados da compra não foram enviados." };
  }
  const payload = JSON.parse(payloadString);

  const idFornecedor = payload.idFornecedor;

  if (!idFornecedor) {
    return { mensagem: "Um fornecedor deve ser selecionado." };
  }
  if (!payload.itens || payload.itens.length === 0) {
    return { mensagem: "É necessário adicionar pelo menos um produto à compra." };
  }

  for (const item of payload.itens) {
    const dadosItemValidados = EsquemaItemCompra.safeParse(item);

    if (!dadosItemValidados.success) {
      return {
        erros: dadosItemValidados.error.flatten().fieldErrors,
        mensagem: `Falha na validação do item "${item.nome || "desconhecido"}". Verifique os campos.`,
      };
    }

    const itemParaApi = {
      idProduto: dadosItemValidados.data.id,
      idFornecedor: idFornecedor,
      quantidade: dadosItemValidados.data.quantidade,
      valorUnitario: dadosItemValidados.data.valor,
    };

    try {
      const res = await fetch(`${baseUrl}/compra/registrarCompra`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(itemParaApi),
      });

      if (!res.ok) {
        const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido do servidor." }));
        return { mensagem: `Erro ao registrar o item ${item.nome}: ${erroBody.message || res.statusText}` };
      }
    } catch (error) {
      console.error(`Erro ao registrar item de compra ${item.id}:`, error);
      return { mensagem: `Erro de rede ao tentar registrar o item ${item.nome}.` };
    }
  }

  revalidatePath("/compras");
  revalidatePath("/produtos");
  return { mensagem: "Compra registrada com sucesso!" };
}

export async function excluirCompra(
  idCompraItem: number,
  prevState: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null; // Pega o token do formulário

  if (!token) {
    return { mensagem: "Ação não autorizada." };
  }
  if (!idCompraItem) {
    return { mensagem: "ID da compra inválido." };
  }

  try {
    const res = await fetch(`${baseUrl}/compra/deletar/${idCompraItem}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido do servidor." }));
      return { mensagem: `Erro ao excluir compra: ${erroBody.message || res.statusText}` };
    }
  } catch (error) {
    console.error(`Erro ao excluir item de compra ${idCompraItem}:`, error);
    return { mensagem: "Erro de rede: Falha ao conectar com o servidor." };
  }

  revalidatePath("/compras");
  revalidatePath("/produtos");
  return { mensagem: "Item da compra excluído com sucesso." };
}

// --- AÇÕES DE VENDAS ---

// Esta ação registra uma venda completa (dados da venda + itens) em uma única chamada.
export async function registrarVenda(prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Ação não autorizada. Faça login novamente." };
  }

  const payloadString = formData.get("payload") as string;
  const payload = JSON.parse(payloadString);

  if (!payload.idFormaPagamento) {
    return { mensagem: "Uma forma de pagamento deve ser selecionada." };
  }
  if (!payload.itens || payload.itens.length === 0) {
    return { mensagem: "Adicione pelo menos um produto ao carrinho." };
  }

  // Valida cada item da venda
  const itensParaApi = [];
  for (const item of payload.itens) {
    const dadosItemValidados = EsquemaVendaItem.safeParse(item);
    if (!dadosItemValidados.success) {
      return { mensagem: `Falha na validação do item ID ${item.idProduto}.` };
    }
    itensParaApi.push(dadosItemValidados.data);
  }

  const vendaParaApi = {
    ...payload,
    itens: itensParaApi,
  };

  try {
    const res = await fetch(`${baseUrl}/venda/salvar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(vendaParaApi),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido do servidor." }));
      return { mensagem: `Erro do servidor ao registrar venda: ${erroBody.message || res.statusText}` };
    }
  } catch (error) {
    console.error("Erro ao registrar venda:", error);
    return { mensagem: "Erro de rede: Falha ao conectar com o servidor." };
  }

  revalidatePath("/meusPedidos");
  revalidatePath("/produtos");
  return { mensagem: "Pedido finalizado com sucesso!" };
}

export async function marcarVendaComoPaga(vendaId: number, token: string | null) {
  if (!token) return { mensagem: "Ação não autorizada." };
  if (!vendaId) return { mensagem: "ID da venda inválido." };

  const payload = { timestamp: new Date().toISOString() };

  try {
    const res = await fetch(`${baseUrl}/venda/${vendaId}/confirmarPagamento`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido." }));
      return { mensagem: `Erro do servidor: ${erroBody.message}` };
    }
  } catch (error) {
    console.error(`Erro ao marcar venda ${vendaId} como paga:`, error);
    return { mensagem: "Erro de rede ao tentar atualizar a venda." };
  }

  revalidatePath("/vendas");
  revalidatePath("/meusPedidos");
  return { mensagem: "Venda marcada como paga com sucesso!" };
}

export async function marcarVendaComoEntregue(vendaId: number, token: string | null) {
  if (!token) return { mensagem: "Ação não autorizada." };
  if (!vendaId) return { mensagem: "ID da venda inválido." };

  const payload = { timestamp: new Date().toISOString() };

  try {
    const res = await fetch(`${baseUrl}/venda/${vendaId}/confirmarEntrega`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido." }));
      return { mensagem: `Erro do servidor: ${erroBody.message}` };
    }
  } catch (error) {
    console.error(`Erro ao marcar venda ${vendaId} como entregue:`, error);
    return { mensagem: "Erro de rede ao tentar atualizar a venda." };
  }

  revalidatePath("/vendas");
  revalidatePath("/meusPedidos");
  return { mensagem: "Venda marcada como entregue com sucesso!" };
}

export async function cancelarVendaAdmin(vendaId: number, token: string | null) {
  if (!token) return { mensagem: "Ação não autorizada." };
  if (!vendaId) return { mensagem: "ID da venda inválido." };

  try {
    const res = await fetch(`${baseUrl}/venda/${vendaId}/cancelar`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido." }));
      return { mensagem: `Erro do servidor: ${erroBody.message}` };
    }
  } catch (error) {
    console.error(`Erro ao cancelar venda ${vendaId}:`, error);
    return { mensagem: "Erro de rede ao tentar cancelar a venda." };
  }

  revalidatePath("/vendas");
  revalidatePath("/meusPedidos");
  revalidatePath("/produtos"); // Estoque pode ser revertido
  return { mensagem: "Venda cancelada." };
}

export async function adicionarEndereco(prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Ação não autorizada. Faça login novamente." };
  }

  const cepLimpo = (formData.get("cep") as string)?.replace(/\D/g, "");
  formData.set("cep", cepLimpo);

  const dadosValidados = EsquemaEndereco.safeParse(Object.fromEntries(formData.entries()));

  if (!dadosValidados.success) {
    return {
      erros: dadosValidados.error.flatten().fieldErrors,
      mensagem: "Falha na validação. Verifique os campos do endereço.",
    };
  }

  const payloadParaApi = {
    endereco: {
      cep: dadosValidados.data.cep,
      logradouro: dadosValidados.data.logradouro,
      numero: dadosValidados.data.numero,
      complemento: dadosValidados.data.complemento,
      bairro: dadosValidados.data.bairro,
      cidade: dadosValidados.data.cidade,
      uf: dadosValidados.data.uf,
    },
    isPrincipal: dadosValidados.data.isPrincipal || false,
  };

  try {
    const res = await fetch(`${baseUrl}/meus-enderecos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payloadParaApi),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido." }));
      return { mensagem: `Falha ao adicionar endereço: ${erroBody.message}` };
    }
  } catch (error) {
    console.error("Erro de conexão ao adicionar endereço:", error);
    return { mensagem: "Não foi possível conectar ao servidor." };
  }

  revalidatePath("/minhaConta");
  return { mensagem: "Endereço adicionado com sucesso!" };
}

export async function editarEndereco(id: number, prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Ação não autorizada. Faça login novamente." };
  }

  // Limpa o CEP antes da validação
  const cepLimpo = (formData.get("cep") as string)?.replace(/\D/g, "");
  formData.set("cep", cepLimpo);

  const dadosValidados = EsquemaEndereco.safeParse(Object.fromEntries(formData.entries()));

  if (!dadosValidados.success) {
    return {
      erros: dadosValidados.error.flatten().fieldErrors,
      mensagem: "Falha na validação. Verifique os campos do endereço.",
    };
  }

  const payloadParaApi = {
    cep: dadosValidados.data.cep,
    logradouro: dadosValidados.data.logradouro,
    numero: dadosValidados.data.numero,
    complemento: dadosValidados.data.complemento,
    bairro: dadosValidados.data.bairro,
    cidade: dadosValidados.data.cidade,
    uf: dadosValidados.data.uf,
  };

  try {
    const res = await fetch(`${baseUrl}/meus-enderecos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payloadParaApi),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido." }));
      return { mensagem: `Falha ao atualizar endereço: ${erroBody.message}` };
    }
  } catch (error) {
    console.error("Erro de conexão ao atualizar endereço:", error);
    return { mensagem: "Não foi possível conectar ao servidor." };
  }

  revalidatePath("/minha-conta");
  return { mensagem: "Endereço atualizado com sucesso!" };
}

export async function deletarEndereco(id: number, prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Ação não autorizada." };
  }

  try {
    const res = await fetch(`${baseUrl}/meus-enderecos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido do servidor." }));
      return { mensagem: `Erro ao excluir endereço: ${erroBody.message || res.statusText}` };
    }
  } catch (error) {
    console.error(`Erro ao excluir endereço ${id}:`, error);
    return { mensagem: "Erro de rede: Falha ao conectar com o servidor." };
  }

  revalidatePath("/minha-conta");
  return { mensagem: "Endereço excluído com sucesso." };
}

export async function cancelarVenda(orderId: number, token: string | null) {
  if (!token) return { mensagem: "Ação não autorizada." };
  if (!orderId) {
    return { mensagem: "ID do pedido é inválido." };
  }
  // Esta ação é a mesma que cancelarVendaAdmin, mas chamada por um cliente. A API decidirá a permissão.
  try {
    const res = await fetch(`${baseUrl}/venda/${orderId}/cancelar`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({ message: "Erro desconhecido." }));
      return { mensagem: `Erro ao cancelar pedido: ${erroBody.message}` };
    }
  } catch (error) {
    console.error(`Erro ao cancelar pedido ${orderId}:`, error);
    return { mensagem: "Erro de rede ao tentar cancelar o pedido." };
  }

  revalidatePath("/meusPedidos");
  revalidatePath("/produtos"); // Estoque pode ser revertido
  return { mensagem: "Pedido cancelado com sucesso." };
}

export async function editarPerfil(prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) return { mensagem: "Ação não autorizada." };

  // Limpa o celular antes de validar
  const celularLimpo = (formData.get("celular") as string)?.replace(/\D/g, "");
  formData.set("celular", celularLimpo);

  const dadosValidados = EsquemaPerfil.safeParse(Object.fromEntries(formData.entries()));

  if (!dadosValidados.success) {
    return { erros: dadosValidados.error.flatten().fieldErrors, mensagem: "Falha na validação." };
  }

  try {
    const res = await fetch(`${baseUrl}/usuario/atualizar-perfil`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(dadosValidados.data),
    });

    if (!res.ok) {
      const erro = await res.json().catch(() => ({}));
      return { mensagem: `Erro: ${erro.message || "Não foi possível salvar as alterações."}` };
    }
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { mensagem: "Erro de conexão com o servidor." };
  }

  revalidatePath("/minha-conta");
  return { mensagem: "Perfil atualizado com sucesso!" };
}

// --- ACTION PARA ALTERAR A SENHA ---
export async function alterarSenha(prevState: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) return { mensagem: "Ação não autorizada." };

  const dadosValidados = EsquemaAlterarSenha.safeParse(Object.fromEntries(formData.entries()));

  if (!dadosValidados.success) {
    return { erros: dadosValidados.error.flatten().fieldErrors, mensagem: "Falha na validação." };
  }

  try {
    const res = await fetch(`${baseUrl}/usuario/alterar-senha`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(dadosValidados.data),
    });

    if (!res.ok) {
      const erro = await res.json().catch(() => ({}));
      return { mensagem: `Erro: ${erro.message || "Não foi possível alterar a senha."}` };
    }
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return { mensagem: "Erro de conexão com o servidor." };
  }

  return { mensagem: "Senha alterada com sucesso!" };
}

export async function definirEnderecoPrincipal(
  id: number,
  prevState: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { mensagem: "Ação não autorizada. O token não foi encontrado no formulário." };
  }

  const url = `${baseUrl}/meus-enderecos/${id}/definir-principal`;

  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        // Adicione esta linha para garantir que a requisição seja tratada como uma API call
        "Content-Type": "application/json",
        // O cabeçalho de autorização já estava correto
        Authorization: `Bearer ${token}`,
      },
      // Não há necessidade de um 'body' para esta ação específica
    });

    if (!res.ok) {
      // O backend pode retornar um corpo de erro mesmo com status 401
      const erroBody = await res.json().catch(() => ({
        message: "O servidor retornou um erro inesperado.",
      }));
      // A mensagem agora virá diretamente do JSON de erro do seu SecurityConfig
      return { mensagem: `Erro: ${erroBody.message || res.statusText}` };
    }
  } catch (error) {
    console.error(`Erro de rede ao definir endereço principal ${id}:`, error);
    return { mensagem: "Erro de rede ao conectar com o servidor." };
  }

  revalidatePath("/minha-conta");
  return { mensagem: "Endereço principal atualizado com sucesso." };
}
