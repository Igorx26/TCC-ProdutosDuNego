package backend.ProdutosDuNego.rest.controller;

import backend.ProdutosDuNego.model.CompraItemModel;
import backend.ProdutosDuNego.rest.dto.CompraItemDTO;
import backend.ProdutosDuNego.service.CompraService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/compra")
public class CompraController {

    private final CompraService compraService;

    @Autowired
    public CompraController(CompraService compraService) {
        this.compraService = compraService;
    }

    /**
     * Endpoint para o ADMIN listar todos os registros de compra.
     * URL: GET /compras/obterTodas
     */
    @GetMapping("/obterTodas")
    public ResponseEntity<List<CompraItemModel>> obterTodasAsCompras() {
        List<CompraItemModel> compras = compraService.obterTodasAsCompras();
        return ResponseEntity.ok(compras);
    }

    /**
     * Endpoint para registrar uma nova compra de um item de produto de um fornecedor.
     * Esta ação atualiza o estoque do produto correspondente.
     * URL: POST /compras/registrarCompra
     */
    @PostMapping("/registrarCompra")
    public ResponseEntity<Void> registrarCompra(@Valid @RequestBody CompraItemDTO dto) {
        compraService.registrarCompra(dto);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint para o ADMIN deletar permanentemente um registro de compra.
     * URL: DELETE /compras/deletar/1
     */
    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<Void> deletarCompra(@PathVariable Long id) {
        compraService.deletarCompra(id);
        return ResponseEntity.noContent().build();
    }
}