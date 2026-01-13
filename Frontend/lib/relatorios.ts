import { toast } from "sonner";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

/**
 * Função genérica para solicitar um relatório do backend e iniciar o download.
 * @param endpoint O caminho do endpoint do relatório (ex: "relatorios/vendas/pdf").
 * @param nomeArquivo O nome que o arquivo baixado terá.
 * @param params Um objeto opcional com os parâmetros de query (ex: { dataInicial: '2025-01-01' }).
 */
export async function solicitarRelatorio(
  endpoint: string,
  nomeArquivo: string,
  params?: Record<string, string>
) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    toast.error("Erro de autenticação. Por favor, faça login novamente.");
    throw new Error("Token não encontrado.");
  }

  // Constrói a URL com os parâmetros
  const urlParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      // Adiciona o parâmetro apenas se o valor não for nulo ou vazio
      if (value) {
        urlParams.append(key, value);
      }
    });
  }

  const queryString = urlParams.toString();
  const finalUrl = `${baseUrl}/${endpoint}${queryString ? `?${queryString}` : ""}`;

  try {
    const response = await fetch(finalUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const erroBody = await response.json().catch(() => ({ message: "Erro desconhecido ao gerar relatório." }));
      toast.error(`Falha ao gerar o relatório: ${erroBody.message || response.statusText}`);
      throw new Error(`Erro do servidor: ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", nomeArquivo);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

  } catch (error) {
    console.error(`Erro ao solicitar o relatório de ${endpoint}:`, error);
    if (error instanceof TypeError) {
      toast.error("Erro de conexão. Não foi possível contatar o servidor.");
    }
    throw error;
  }
}