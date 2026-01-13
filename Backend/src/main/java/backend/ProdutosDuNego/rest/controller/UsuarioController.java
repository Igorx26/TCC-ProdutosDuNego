package backend.ProdutosDuNego.rest.controller;

import backend.ProdutosDuNego.rest.dto.*;
import backend.ProdutosDuNego.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuario")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Autowired
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /**
     * Endpoint para registrar um novo usuário.
     * URL: POST /usuario/salvar
     */
    @PostMapping("/salvar")
    public ResponseEntity<UsuarioResponseDTO> salvar(@Valid @RequestBody UsuarioCreateDTO dto) {
        UsuarioResponseDTO novoUsuario = usuarioService.salvar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoUsuario);
    }

    @PostMapping("/salvarComEndereco")
    public ResponseEntity<UsuarioResponseDTO> salvarComEndereco(@Valid @RequestBody UsuarioComEnderecoDTO dto) {
        UsuarioResponseDTO novoUsuario = usuarioService.salvarUsuarioComEndereco(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoUsuario);
    }

    /**
     * Endpoint para listar todos os usuários.
     * URL: GET /usuario/obterTodos
     */
    @GetMapping("/obterTodos")
    public ResponseEntity<List<UsuarioResponseDTO>> obterTodos() {
        return ResponseEntity.ok(usuarioService.obterTodos());
    }

    /**
     * Endpoint para buscar um usuário por ID.
     * URL: GET /usuario/obterPorId/1
     */
    @GetMapping("/obterPorId/{id}")
    public ResponseEntity<UsuarioResponseDTO> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obterPorId(id));
    }

    /**
     * Endpoint para atualizar os dados cadastrais de um usuário.
     * URL: PUT /usuario/atualizar/1
     */
    @PutMapping("/atualizar/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizar(@PathVariable Long id, @Valid @RequestBody UsuarioUpdateDTO dto) {
        return ResponseEntity.ok(usuarioService.atualizar(id, dto));
    }

    @PutMapping("/atualizar-perfil")
    public ResponseEntity<UsuarioResponseDTO> atualizarPerfil(@Valid @RequestBody UsuarioUpdateDTO dto) {
        // O serviço pegará o usuário do token, então não precisamos de ID
        UsuarioResponseDTO usuarioAtualizado = usuarioService.atualizarPerfil(dto);
        return ResponseEntity.ok(usuarioAtualizado);
    }

    @PatchMapping("/alterar-senha")
    public ResponseEntity<Void> alterarSenha(@Valid @RequestBody UsuarioUpdatePasswordDTO dto) {
        usuarioService.alterarSenha(dto);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint para desativar (soft delete) um usuário.
     * URL: DELETE /usuario/deletar/1
     */
    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint para reativar (soft delete) um usuário.
     * URL: PATCH /usuario/reativar/1
     */
    @PatchMapping("/reativar/{id}")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        usuarioService.reativar(id);
        return ResponseEntity.noContent().build();
    }
}