package backend.ProdutosDuNego.rest.controller;

import backend.ProdutosDuNego.rest.dto.ProdutoDTO;
import backend.ProdutosDuNego.rest.dto.ProdutoResponseDTO;
import backend.ProdutosDuNego.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/produto")
public class ProdutoController {

    private final ProdutoService produtoService;

    @Autowired
    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    /**
     * Endpoint para criar um novo produto.
     * URL: POST /produto/salvar
     */
    @PostMapping("/salvar")
    public ResponseEntity<ProdutoResponseDTO> salvar(@Valid @RequestBody ProdutoDTO dto) {
        ProdutoResponseDTO novoProduto = produtoService.salvar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoProduto);
    }

    /**
     * Endpoint para listar todos os produtos ativos.
     * URL: GET /produto/obterTodos
     */
    @GetMapping("/obterTodos")
    public ResponseEntity<List<ProdutoResponseDTO>> obterTodos() {
        return ResponseEntity.ok(produtoService.obterTodos());
    }

    /**
     * Endpoint para buscar um produto por ID.
     * URL: GET /produto/obterPorId/1
     */
    @GetMapping("/obterPorId/{id}")
    public ResponseEntity<ProdutoResponseDTO> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.obterPorId(id));
    }

    /**
     * Endpoint para atualizar os dados de um produto.
     * URL: PUT /produto/atualizar/1
     */
    @PutMapping("/atualizar/{id}")
    public ResponseEntity<ProdutoResponseDTO> atualizar(@PathVariable Long id, @Valid @RequestBody ProdutoDTO dto) {
        return ResponseEntity.ok(produtoService.atualizar(id, dto));
    }

    /**
     * Endpoint para desativar (soft delete) um produto.
     * URL: DELETE /produto/deletar/1
     */
    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        produtoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint para reativar um produto.
     * URL: PATCH /produto/reativar/1
     */
    @PatchMapping("/reativar/{id}")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        produtoService.reativar(id);
        return ResponseEntity.noContent().build();
    }
}