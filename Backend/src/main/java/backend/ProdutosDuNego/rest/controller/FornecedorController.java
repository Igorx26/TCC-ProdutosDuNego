package backend.ProdutosDuNego.rest.controller;

import backend.ProdutosDuNego.rest.dto.FornecedorDTO;
import backend.ProdutosDuNego.service.FornecedorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fornecedor")
public class FornecedorController {

    private final FornecedorService fornecedorService;

    @Autowired
    public FornecedorController(FornecedorService fornecedorService) {
        this.fornecedorService = fornecedorService;
    }

    @PostMapping("/salvar")
    public ResponseEntity<FornecedorDTO> salvar(@Valid @RequestBody FornecedorDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fornecedorService.salvar(dto));
    }

    @GetMapping("/obterTodos")
    public ResponseEntity<List<FornecedorDTO>> obterTodos() {
        return ResponseEntity.ok(fornecedorService.obterTodos());
    }

    @GetMapping("/obterPorId/{id}")
    public ResponseEntity<FornecedorDTO> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(fornecedorService.obterPorId(id));
    }

    @PutMapping("/atualizar/{id}")
    public ResponseEntity<FornecedorDTO> atualizar(@PathVariable Long id, @Valid @RequestBody FornecedorDTO dto) {
        return ResponseEntity.ok(fornecedorService.atualizar(id, dto));
    }

    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        fornecedorService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/reativar/{id}")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        fornecedorService.reativar(id);
        return ResponseEntity.noContent().build();
    }
}