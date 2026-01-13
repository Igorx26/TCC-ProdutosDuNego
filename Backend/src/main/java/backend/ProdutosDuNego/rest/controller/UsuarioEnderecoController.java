package backend.ProdutosDuNego.rest.controller;

import backend.ProdutosDuNego.rest.dto.EnderecoResponseDTO;
import backend.ProdutosDuNego.rest.dto.UsuarioEnderecoCreateDTO;
import backend.ProdutosDuNego.service.EnderecoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;import org.springframework.security.access.prepost.PreAuthorize; // Importe esta anotação

@RestController
@RequestMapping("/usuarios/{usuarioId}/enderecos")
public class UsuarioEnderecoController {

    private final EnderecoService enderecoService;

    @Autowired
    public UsuarioEnderecoController(EnderecoService enderecoService) {
        this.enderecoService = enderecoService;
    }

    @PostMapping
    // Apenas um admin ou o próprio usuário pode adicionar um endereço para si mesmo
    @PreAuthorize("hasRole('ADMIN') or @securityService.checkOwnership(#usuarioId)")
    public ResponseEntity<EnderecoResponseDTO> adicionarEndereco(@PathVariable Long usuarioId, @Valid @RequestBody UsuarioEnderecoCreateDTO dto) {
        EnderecoResponseDTO novoEndereco = enderecoService.adicionarEndereco(usuarioId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoEndereco);
    }

    @GetMapping
    // Apenas um admin ou o próprio usuário pode listar seus endereços
    @PreAuthorize("hasRole('ADMIN') or @securityService.checkOwnership(#usuarioId)")
    public ResponseEntity<List<EnderecoResponseDTO>> listarEnderecosPorUsuario(@PathVariable Long usuarioId) {
        List<EnderecoResponseDTO> enderecos = enderecoService.listarEnderecosPorUsuario(usuarioId);
        return ResponseEntity.ok(enderecos);
    }

    @DeleteMapping("/{usuarioEnderecoId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.checkOwnership(#usuarioId)")
    public ResponseEntity<Void> deletarEndereco(@PathVariable Long usuarioId, @PathVariable Long usuarioEnderecoId) {
        enderecoService.deletarEndereco(usuarioId, usuarioEnderecoId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{usuarioEnderecoId}/reativar")
    @PreAuthorize("hasRole('ADMIN') or @securityService.checkOwnership(#usuarioId)")
    public ResponseEntity<Void> reativarEndereco(@PathVariable Long usuarioId, @PathVariable Long usuarioEnderecoId) {
        enderecoService.reativarEndereco(usuarioId, usuarioEnderecoId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{usuarioEnderecoId}/definirPrincipal")
    @PreAuthorize("hasRole('ADMIN') or @securityService.checkOwnership(#usuarioId)")
    public ResponseEntity<Void> definirComoPrincipal(@PathVariable Long usuarioId, @PathVariable Long usuarioEnderecoId) {
        enderecoService.definirComoPrincipal(usuarioId, usuarioEnderecoId);
        return ResponseEntity.noContent().build();
    }
}