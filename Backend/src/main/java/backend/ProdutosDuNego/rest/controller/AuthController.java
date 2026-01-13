package backend.ProdutosDuNego.rest.controller;

import backend.ProdutosDuNego.model.UsuarioModel;
import backend.ProdutosDuNego.rest.dto.LoginDTO;
import backend.ProdutosDuNego.rest.dto.TokenDTO;
import backend.ProdutosDuNego.service.TokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/login")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;

    @PostMapping
    public ResponseEntity<TokenDTO> login(@RequestBody @Valid LoginDTO dto) {
        // 1. Cria um objeto de autenticação com as credenciais do DTO
        var authenticationToken = new UsernamePasswordAuthenticationToken(dto.nomeUsuario(), dto.senha());

        // 2. Dispara o processo de autenticação do Spring Security
        // O Spring vai chamar nosso AuthenticationService, que busca o usuário,
        // e usar nosso PasswordEncoder para comparar as senhas.
        Authentication authentication = authenticationManager.authenticate(authenticationToken);

        // 3. Se a autenticação for bem-sucedida, pega o usuário autenticado
        var usuario = (UsuarioModel) authentication.getPrincipal();

        // 4. Gera o token JWT usando nosso TokenService
        var tokenJWT = tokenService.gerarToken(usuario);

        // 5. Retorna o token em um DTO
        return ResponseEntity.ok(new TokenDTO(tokenJWT));
    }
}