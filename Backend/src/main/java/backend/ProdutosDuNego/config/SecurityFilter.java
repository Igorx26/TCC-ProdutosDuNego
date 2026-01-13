package backend.ProdutosDuNego.config; // ou o pacote onde ele estiver

import backend.ProdutosDuNego.repository.UsuarioRepository; // IMPORTAR
import backend.ProdutosDuNego.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails; // IMPORTAR
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    // PASSO 1: INJETAR O REPOSITÓRIO DE USUÁRIO
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String tokenJWT = recuperarToken(request);

        if (tokenJWT != null) {
            String subject = tokenService.getSubject(tokenJWT); // Pega o username do token

            if (subject != null) {
                // PASSO 2: BUSCAR O USUÁRIO COMPLETO NO BANCO DE DADOS
                UserDetails usuario = usuarioRepository.findByNomeUsuario(subject).orElse(null);

                if (usuario != null) {
                    // PASSO 3: CRIAR A AUTENTICAÇÃO COM O OBJETO 'USUARIO' COMPLETO
                    // Agora o 'Principal' será o objeto UsuarioModel, e não mais uma String.
                    // Usamos usuario.getAuthorities() para pegar as permissões já definidas no seu UsuarioModel.
                    var authentication = new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());

                    // Define a nova autenticação no contexto do Spring
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }
}