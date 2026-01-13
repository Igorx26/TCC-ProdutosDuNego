"use client";

import { Usuario } from "@/lib/definicoes";
import { jwtDecode } from "jwt-decode";
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";

const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || "produtosDuNego:auth-token";

// Interface para o conteúdo do token JWT
interface TokenPayload {
  sub: string; // Geralmente o username
  id: number; // ID do usuário
  admin: boolean; // Se o usuário é admin
  exp: number; // Data de expiração do token
}

interface ResultadoLogin {
  success: boolean;
  message: string;
  usuario?: Usuario | null;
}

interface TipoContextoAuth {
  usuario: Usuario | null;
  carregando: boolean;
  login: (nomeUsuario: string, senha: string) => Promise<ResultadoLogin>;
  sair: () => void;
  recarregarUsuario: () => Promise<void>;
}

const ContextoAuth = createContext<TipoContextoAuth | undefined>(undefined);

export function AutenticacaoProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const sair = useCallback(() => {
    setUsuario(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }, []);

  // Função para buscar os dados completos do usuário após o login
  const buscarEDefinirUsuario = useCallback(
    async (id: number, token: string) => {
      try {
        const response = await fetch(`http://localhost:8080/api/usuario/obterPorId/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Falha ao buscar os dados do usuário.");
        }

        const dadosCompletosUsuario: Usuario = await response.json();
        setUsuario(dadosCompletosUsuario);
        return dadosCompletosUsuario;
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        sair();
        return null;
      }
    },
    [sair]
  );

  const recarregarUsuario = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      try {
        const tokenDecodificado = jwtDecode<TokenPayload>(token);
        if (tokenDecodificado.exp * 1000 > Date.now()) {
          await buscarEDefinirUsuario(tokenDecodificado.id, token);
        } else {
          sair();
        }
      } catch {
        sair();
      }
    }
  }, [buscarEDefinirUsuario, sair]);

  // Verifica se existe uma sessão válida no localStorage ao carregar a página
  useEffect(() => {
    const verificarSessao = async () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          const tokenDecodificado = jwtDecode<TokenPayload>(token);
          if (tokenDecodificado.exp * 1000 > Date.now()) {
            // Verifica se o token não expirou
            await buscarEDefinirUsuario(tokenDecodificado.id, token);
          } else {
            sair(); // Token expirado
          }
        }
      } catch (error) {
        console.error("Falha ao processar token:", error);
        sair();
      } finally {
        setCarregando(false);
      }
    };
    verificarSessao();
  }, [buscarEDefinirUsuario, sair]);

  const login = async (nomeUsuario: string, senha: string): Promise<ResultadoLogin> => {
    if (!nomeUsuario || !senha) {
      return { success: false, message: "Por favor, preencha todos os campos." };
    }

    try {
      const response = await fetch(`http://localhost:8080/api/login`, {
        // Endpoint de login do Spring Security
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeUsuario, senha }),
      });
      console.log("Requisição de login:", { nomeUsuario, senha });

      console.log("Resposta do servidor:", response);

      if (!response.ok) {
        return { success: false, message: "Usuário ou senha inválidos." };
      }

      const { token } = await response.json();
      localStorage.setItem(AUTH_TOKEN_KEY, token);

      const tokenDecodificado = jwtDecode<TokenPayload>(token);

      const usuarioCompleto = await buscarEDefinirUsuario(tokenDecodificado.id, token);

      if (!usuarioCompleto) {
        return { success: false, message: "Falha ao obter dados do usuário após o login." };
      }
      return { success: true, message: "Login bem-sucedido!", usuario: usuarioCompleto };
    } catch (error) {
      console.error("Erro na requisição de login:", error);
      return { success: false, message: "Falha na comunicação com o servidor." };
    }
  };

  return (
    <ContextoAuth.Provider value={{ usuario, carregando, login, sair, recarregarUsuario }}>
      {children}
    </ContextoAuth.Provider>
  );
}

export function useAuth() {
  const context = useContext(ContextoAuth);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AutenticacaoProvider");
  }
  return context;
}
