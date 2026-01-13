package backend.ProdutosDuNego.rest.controller;

import backend.ProdutosDuNego.rest.dto.MedidaDTO;
import backend.ProdutosDuNego.service.MedidaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medida")
public class MedidaController {

    private final MedidaService medidaService;

    @Autowired
    public MedidaController(MedidaService medidaService) {
        this.medidaService = medidaService;
    }

    /**
     * Endpoint para buscar uma medida por ID.
     * URL: GET /medida/obterPorId/1
     */
    @GetMapping("/obterPorId/{id}")
    public ResponseEntity<MedidaDTO> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(medidaService.obterPorId(id));
    }

    /**
     * Endpoint para listar todas as medidas.
     * URL: GET /medida/obterTodos
     */
    @GetMapping("/obterTodos")
    public ResponseEntity<List<MedidaDTO>> obterTodos() {
        return ResponseEntity.ok(medidaService.obterTodos());
    }

    /**
     * Endpoint para registrar uma nova medida.
     * URL: POST /medida/salvar
     */
    @PostMapping("/salvar")
    public ResponseEntity<MedidaDTO> salvar(@Valid @RequestBody MedidaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medidaService.salvar(dto));
    }
    /**
     * Endpoint para atualizar os dados cadastrais de um medida.
     * URL: PUT /medida/atualizar/1
     */
    @PutMapping("/atualizar/{id}")
    public ResponseEntity<MedidaDTO> atualizar(@PathVariable Long id, @Valid @RequestBody MedidaDTO dto) {
        return ResponseEntity.ok(medidaService.atualizar(id, dto));
    }
    /**
     * Endpoint para desativar (soft delete) um medida.
     * URL: DELETE /medida/deletar/1
     */
    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        medidaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
    /**
     * Endpoint para reativar uma medida.
     * URL: PATCH /medida/reativar/1
     */
    @PatchMapping("/reativar/{id}")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        medidaService.reativar(id);
        return ResponseEntity.noContent().build();
    }
}