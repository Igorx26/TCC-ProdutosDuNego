package backend.ProdutosDuNego.service;

import backend.ProdutosDuNego.exception.BusinessRuleException;
import backend.ProdutosDuNego.model.UsuarioModel;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class SecurityService {

    /**
     * Obtém o objeto do usuário que está atualmente autenticado.
     * @return O UsuarioModel do usuário logado.
     */
    public UsuarioModel getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new BusinessRuleException("Usuário não autenticado. Por favor, faça o login.");
        }
        return (UsuarioModel) authentication.getPrincipal();
    }

    /**
     * Verifica se o usuário autenticado é um Admin OU se ele é o "dono" do recurso
     * que está tentando acessar (comparando os IDs).
     * @param resourceOwnerId O ID do dono do recurso (ex: o 'usuarioId' da URL).
     */
    public void checkOwnershipOrAdmin(Long resourceOwnerId) {
        UsuarioModel usuarioLogado = getAuthenticatedUser();

        if (!usuarioLogado.isAdmin() && !usuarioLogado.getId().equals(resourceOwnerId)) {
            throw new BusinessRuleException("Acesso negado. Você não tem permissão para executar esta ação em um recurso que não é seu.");
        }
    }
}