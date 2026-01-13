package backend.ProdutosDuNego.service;

import backend.ProdutosDuNego.model.UsuarioModel;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    private static final String ISSUER = "produtos-du-nego-api";

    public String gerarToken(UsuarioModel usuario) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer(ISSUER)
                    .withSubject(usuario.getNomeUsuario())
                    .withClaim("id", usuario.getId())
                    .withClaim("admin", usuario.isAdmin()) // Perfeito, já estava correto!
                    .withExpiresAt(gerarDataDeExpiracao())
                    .sign(algorithm);
        } catch (JWTCreationException exception){
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }
    }

    public String getSubject(String tokenJWT) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer(ISSUER)
                    .build()
                    .verify(tokenJWT)
                    .getSubject();
        } catch (JWTVerificationException exception){
            // LINHA DE DEPURAÇÃO CRÍTICA
            System.err.println("### Falha ao verificar o token (getSubject): " + exception.getMessage());
            return null;
        }
    }

    public boolean isAdmin(String tokenJWT) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            Boolean adminClaim = JWT.require(algorithm)
                    .withIssuer(ISSUER)
                    .build()
                    .verify(tokenJWT)
                    .getClaim("admin").asBoolean();
            return adminClaim != null && adminClaim;
        } catch (JWTVerificationException exception) {
            // LINHA DE DEPURAÇÃO CRÍTICA
            System.err.println("### Falha ao verificar o token (isAdmin): " + exception.getMessage());
            return false;
        }
    }

    private Instant gerarDataDeExpiracao() {
        // Exemplo: Token expira em 1 dia
        return LocalDateTime.now().plusDays(1).toInstant(ZoneOffset.of("-03:00"));
    }
}