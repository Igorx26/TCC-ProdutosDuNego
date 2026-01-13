package backend.ProdutosDuNego.rest.controller;

import backend.ProdutosDuNego.model.UsuarioModel;
import backend.ProdutosDuNego.rest.dto.EnderecoDTO; // Importe o DTO de entrada para edição
import backend.ProdutosDuNego.rest.dto.EnderecoResponseDTO;
import backend.ProdutosDuNego.rest.dto.UsuarioEnderecoCreateDTO;
import backend.ProdutosDuNego.service.EnderecoService;
import backend.ProdutosDuNego.service.SecurityService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/meus-enderecos") // Rota base para ações do usuário logado
public class MeuEnderecoController {

    private final EnderecoService enderecoService;
    private final SecurityService securityService;

    @Autowired
    public MeuEnderecoController(EnderecoService enderecoService, SecurityService securityService) {
        this.enderecoService = enderecoService;
        this.securityService = securityService;
    }

    /**
     * Lista os endereços do usuário logado.
     * URL: GET /api/meus-enderecos
     */
    @GetMapping
    public ResponseEntity<List<EnderecoResponseDTO>> listarMeusEnderecos() {
        UsuarioModel usuarioLogado = securityService.getAuthenticatedUser();
        List<EnderecoResponseDTO> enderecos = enderecoService.listarEnderecosPorUsuario(usuarioLogado.getId());
        return ResponseEntity.ok(enderecos);
    }

    /**
     * Adiciona um novo endereço para o usuário logado.
     * URL: POST /api/meus-enderecos
     */
    @PostMapping
    public ResponseEntity<EnderecoResponseDTO> adicionarMeuEndereco(@Valid @RequestBody UsuarioEnderecoCreateDTO dto) {
        UsuarioModel usuarioLogado = securityService.getAuthenticatedUser();
        EnderecoResponseDTO novoEndereco = enderecoService.adicionarEndereco(usuarioLogado.getId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoEndereco);
    }

    /**
     * Atualiza um endereço do usuário logado.
     * O ID na URL é o da LIGAÇÃO (UsuarioEndereco).
     * URL: PUT /api/meus-enderecos/{usuarioEnderecoId}
     */
    @PutMapping("/{usuarioEnderecoId}")
    public ResponseEntity<EnderecoResponseDTO> atualizarMeuEndereco(
            @PathVariable Long usuarioEnderecoId,
            @Valid @RequestBody EnderecoDTO dto) {

        UsuarioModel usuarioLogado = securityService.getAuthenticatedUser();
        EnderecoResponseDTO enderecoAtualizado = enderecoService.atualizarEnderecoDoUsuario(
                usuarioLogado.getId(),
                usuarioEnderecoId,
                dto
        );
        return ResponseEntity.ok(enderecoAtualizado);
    }

    /**
     * Deleta (desativa) um endereço do usuário logado.
     * O ID na URL é o da LIGAÇÃO (UsuarioEndereco).
     * URL: DELETE /api/meus-enderecos/{usuarioEnderecoId}
     */
    @DeleteMapping("/{usuarioEnderecoId}")
    public ResponseEntity<Void> deletarMeuEndereco(@PathVariable Long usuarioEnderecoId) {
        UsuarioModel usuarioLogado = securityService.getAuthenticatedUser();
        enderecoService.deletarEndereco(usuarioLogado.getId(), usuarioEnderecoId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Define um endereço como o principal para o usuário logado.
     * O ID na URL é o da LIGAÇÃO (UsuarioEndereco).
     * URL: PATCH /api/meus-enderecos/15/definir-principal
     */
    @PatchMapping("/{usuarioEnderecoId}/definir-principal")
    public ResponseEntity<Void> definirMeuEnderecoComoPrincipal(@PathVariable Long usuarioEnderecoId) {
        UsuarioModel usuarioLogado = securityService.getAuthenticatedUser();
        enderecoService.definirComoPrincipal(usuarioLogado.getId(), usuarioEnderecoId);
        return ResponseEntity.noContent().build();
    }
}