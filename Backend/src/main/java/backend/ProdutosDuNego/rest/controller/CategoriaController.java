package backend.ProdutosDuNego.rest.controller;

import backend.ProdutosDuNego.rest.dto.CategoriaDTO;
import backend.ProdutosDuNego.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categoria")
public class CategoriaController {

    private final CategoriaService categoriaService;

    @Autowired
    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    /**
     * Endpoint para buscar uma categoria por ID.
     * URL: GET /categoria/obterPorId/1
     */
    @GetMapping("/obterPorId/{id}")
    public ResponseEntity<CategoriaDTO> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.obterPorId(id));
    }

    /**
     * Endpoint para listar todas as categorias.
     * URL: GET /categoria/obterTodos
     */
    @GetMapping("/obterTodos")
    public ResponseEntity<List<CategoriaDTO>> obterTodos() {
        return ResponseEntity.ok(categoriaService.obterTodos());
    }

    /**
     * Endpoint para registrar uma nova categoria.
     * URL: POST /categoria/salvar
     */
    @PostMapping("/salvar")
    public ResponseEntity<CategoriaDTO> salvar(@Valid @RequestBody CategoriaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaService.salvar(dto));
    }

    /**
     * Endpoint para atualizar os dados cadastrais de uma categoria.
     * URL: PUT /categoria/atualizar/1
     */
    @PutMapping("/atualizar/{id}")
    public ResponseEntity<CategoriaDTO> atualizar(@PathVariable Long id, @Valid @RequestBody CategoriaDTO dto) {
        return ResponseEntity.ok(categoriaService.atualizar(id, dto));
    }

    /**
     * Endpoint para desativar (soft delete) da categoria.
     * URL: DELETE /categoria/deletar/1
     */
    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        categoriaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint para reativar uma categoria.
     * URL: PATCH /categoria/reativar/1
     */
    @PatchMapping("/reativar/{id}")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        categoriaService.reativar(id);
        return ResponseEntity.noContent().build();
    }
}