package backend.ProdutosDuNego.rest.controller;

import backend.ProdutosDuNego.rest.dto.StatusDTO;
import backend.ProdutosDuNego.service.StatusService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/status")
public class StatusController {

    private final StatusService statusService;

    @Autowired
    public StatusController(StatusService statusService) {
        this.statusService = statusService;
    }


    @GetMapping("/obterTodos")
    public ResponseEntity<List<StatusDTO>> obterTodos() {
        return ResponseEntity.ok(statusService.obterTodos());
    }

    @GetMapping("/obterPorId/{id}")
    public ResponseEntity<StatusDTO> obterPorId(@PathVariable Long id) {
        return ResponseEntity.ok(statusService.obterPorId(id));
    }

    @PostMapping("/salvar")
    public ResponseEntity<StatusDTO> salvar(@Valid @RequestBody StatusDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(statusService.salvar(dto));
    }

    @PutMapping("/atualizar/{id}")
    public ResponseEntity<StatusDTO> atualizar(@PathVariable Long id, @Valid @RequestBody StatusDTO dto) {
        return ResponseEntity.ok(statusService.atualizar(id, dto));
    }

    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        statusService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/reativar/{id}")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        statusService.reativar(id);
        return ResponseEntity.noContent().build();
    }
}