package backend.ProdutosDuNego.rest.controller;

import backend.ProdutosDuNego.rest.dto.FormaPagamentoDTO;
import backend.ProdutosDuNego.service.FormaPagamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/formaPagamento") // <-- Alterado para singular
public class FormaPagamentoController {

    private final FormaPagamentoService formaPagamentoService;

    @Autowired
    public FormaPagamentoController(FormaPagamentoService formaPagamentoService) {
        this.formaPagamentoService = formaPagamentoService;
    }

    /**
     * Endpoint para buscar uma forma de pagamento por ID.
     * URL: GET /formaPagamento/obterPorId/1
     */
    @GetMapping("/obterPorId/{id}")
    public ResponseEntity<FormaPagamentoDTO> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(formaPagamentoService.obterPorId(id));
    }

    /**
     * Endpoint para listar todas as formas de pagamento.
     * URL: GET /formaPagamento/obterTodos
     */
    @GetMapping("/obterTodos")
    public ResponseEntity<List<FormaPagamentoDTO>> obterTodos() {
        return ResponseEntity.ok(formaPagamentoService.obterTodos());
    }

    /**
     * Endpoint para registrar uma nova forma de pagamento.
     * URL: POST /formaPagamento/salvar
     */
    @PostMapping("/salvar")
    public ResponseEntity<FormaPagamentoDTO> salvar(@Valid @RequestBody FormaPagamentoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(formaPagamentoService.salvar(dto));
    }

    /**
     * Endpoint para atualizar os dados cadastrais de uma forma de pagamento.
     * URL: PUT /formaPagamento/atualizar/1
     */
    @PutMapping("/{id}")
    public ResponseEntity<FormaPagamentoDTO> atualizar(@PathVariable Long id, @Valid @RequestBody FormaPagamentoDTO dto) {
        return ResponseEntity.ok(formaPagamentoService.atualizar(id, dto));
    }

    /**
     * Endpoint para desativar (soft delete) uma forma de pagamento.
     * URL: DELETE /formaPagamento/deletar/1
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        formaPagamentoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint para reativar uma forma de pagamento.
     * URL: PATCH /forma-pagamento/reativar/1
     */
    @PatchMapping("/reativar/{id}")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        formaPagamentoService.reativar(id);
        return ResponseEntity.noContent().build();
    }
}