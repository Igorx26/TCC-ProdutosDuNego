package backend.ProdutosDuNego.rest.controller;

import backend.ProdutosDuNego.model.UsuarioModel;
import backend.ProdutosDuNego.rest.dto.VendaAjusteDTO;
import backend.ProdutosDuNego.rest.dto.VendaCreateDTO;
import backend.ProdutosDuNego.rest.dto.VendaResponseDTO;
import backend.ProdutosDuNego.rest.dto.VendaTimestampUpdateDTO;
import backend.ProdutosDuNego.service.SecurityService;
import backend.ProdutosDuNego.service.VendaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/venda")
public class VendaController {

    private final VendaService vendaService;
    private final SecurityService securityService;

    @Autowired
    public VendaController(VendaService vendaService, SecurityService securityService) {
        this.vendaService = vendaService;
        this.securityService = securityService;
    }

    /**
     * Endpoint para um cliente LOGADO criar um novo pedido.
     * URL: POST /venda/salvar
     */
    @PostMapping("/salvar")
    public ResponseEntity<VendaResponseDTO> salvarVenda(@Valid @RequestBody VendaCreateDTO dto) {
        UsuarioModel clienteLogado = securityService.getAuthenticatedUser(); // Pega o usuário logado
        VendaResponseDTO novaVenda = vendaService.realizarVenda(clienteLogado.getId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaVenda);
    }

    /**
     * Endpoint para o administrador confirmar que os itens de uma venda foram separados.
     * Altera o status da venda para "SEPARADO".
     * URL: PATCH /vendas/1/confirmarSeparacao
     */
    @PatchMapping("/{id}/confirmarSeparacao")
    public ResponseEntity<Void> confirmarSeparacao(@PathVariable Long id) {
        vendaService.confirmarSeparacao(id);
        return ResponseEntity.noContent().build();
    }
    /**
     * Endpoint para o administrador confirmar a entrega de uma venda.
     * URL: PATCH /vendas/1/confirmar-entrega
     */
    @PatchMapping("/{id}/confirmarEntrega")
    public ResponseEntity<Void> confirmarEntrega(@PathVariable Long id, @Valid @RequestBody VendaTimestampUpdateDTO dto) {
        vendaService.confirmarEntrega(id, dto.timestamp());
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint para o administrador confirmar o pagamento de uma venda.
     * URL: PATCH /vendas/1/confirmarPagamento
     */
    @PatchMapping("/{id}/confirmarPagamento")
    public ResponseEntity<Void> confirmarPagamento(@PathVariable Long id, @Valid @RequestBody VendaTimestampUpdateDTO dto) {
        vendaService.confirmarPagamento(id, dto.timestamp());
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint para o administrador aplicar descontos ou acréscimos em uma venda.
     * URL: PATCH /vendas/1/aplicarAjustes
     */
    @PatchMapping("/{id}/aplicarAjustes")
    public ResponseEntity<VendaResponseDTO> aplicarAjustes(@PathVariable Long id, @RequestBody VendaAjusteDTO dto) {
        VendaResponseDTO vendaAtualizada = vendaService.aplicarAjustes(id, dto);
        return ResponseEntity.ok(vendaAtualizada);
    }
    /**
     * Endpoint para cancelar uma venda.
     * Clientes só podem cancelar vendas "EM ABERTO".
     * Admins podem cancelar vendas em qualquer status, exceto "CONCLUÍDO".
     * URL: PATCH /vendas/1/cancelar
     */
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelarVenda(@PathVariable Long id, Authentication authentication) {
        UsuarioModel usuarioLogado = (UsuarioModel) authentication.getPrincipal();
        vendaService.cancelarVenda(id, usuarioLogado);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint para o ADMIN listar todas as vendas, com filtro opcional por status.
     * URL: GET /venda/obterTodas?status=Em Aberto
     */
    @GetMapping("/obterTodas")
    @PreAuthorize("hasRole('ADMIN')") // Protege a rota para ser acessível apenas por Admins
    public ResponseEntity<List<VendaResponseDTO>> obterTodasAsVendas(@RequestParam(required = false) String status) {
        List<VendaResponseDTO> vendas = vendaService.obterTodas(status);
        return ResponseEntity.ok(vendas);
    }

    /**
     * Endpoint para um CLIENTE logado buscar seu próprio histórico de pedidos.
     * URL: GET /venda/meus-pedidos
     */
    @GetMapping("/meus-pedidos")
    public ResponseEntity<List<VendaResponseDTO>> obterMinhasVendas() {
        List<VendaResponseDTO> vendas = vendaService.obterMinhasVendas();
        return ResponseEntity.ok(vendas);
    }
}