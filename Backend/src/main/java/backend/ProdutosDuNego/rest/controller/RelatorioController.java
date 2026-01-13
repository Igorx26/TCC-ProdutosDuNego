package backend.ProdutosDuNego.rest.controller;

import backend.ProdutosDuNego.rest.dto.RelatorioComprasDTO;
import backend.ProdutosDuNego.rest.dto.RelatorioEstoqueDTO;
import backend.ProdutosDuNego.rest.dto.RelatorioVendasDetalhadoDTO; // <-- DTO ATUALIZADO
import backend.ProdutosDuNego.service.CompraService;
import backend.ProdutosDuNego.service.ProdutoService;
import backend.ProdutosDuNego.service.RelatorioService;
import backend.ProdutosDuNego.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {

    private final VendaService vendaService;
    private final RelatorioService relatorioService;
    private final CompraService compraService;
    private final ProdutoService produtoService;

    @Autowired
    public RelatorioController(VendaService vendaService, RelatorioService relatorioService, CompraService compraService, ProdutoService produtoService) {
        this.vendaService = vendaService;
        this.relatorioService = relatorioService;
        this.compraService = compraService;
        this.produtoService = produtoService;
    }

    /**
     * Endpoint para gerar o relatório DETALHADO de vendas por período em formato PDF.
     * URL: GET /relatorios/vendas/pdf?dataInicial=2025-01-01&dataFinal=2025-01-31
     */
    @GetMapping(value = "/vendas/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<InputStreamResource> gerarRelatorioVendasPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicial,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFinal,@RequestParam(required = false) String status) {

        RelatorioVendasDetalhadoDTO dadosRelatorio = vendaService.gerarRelatorioVendasDetalhado(dataInicial, dataFinal, status);

        ByteArrayInputStream pdf = relatorioService.gerarPdfVendasDetalhado(dadosRelatorio);

        HttpHeaders headers = new HttpHeaders();
        String nomeArquivo = "relatorio_vendas_" + dataInicial + "_a_" + dataFinal + ".pdf";
        headers.add("Content-Disposition", "inline; filename=" + nomeArquivo);

        // 4. Retorna o PDF.
        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdf));
    }
    /**
     * Endpoint para gerar o relatório DETALHADO de compras por período em formato PDF.
     * URL: GET /relatorios/compras/pdf?dataInicial=2025-01-01&dataFinal=2025-01-31
     */
    @GetMapping(value = "/compras/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<InputStreamResource> gerarRelatorioComprasPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicial,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFinal) {

        RelatorioComprasDTO dadosRelatorio = compraService.gerarRelatorioCompras(dataInicial, dataFinal);

        ByteArrayInputStream pdf = relatorioService.gerarPdfComprasDetalhado(dadosRelatorio);

        HttpHeaders headers = new HttpHeaders();
        String nomeArquivo = "relatorio_compras_" + dataInicial + "_a_" + dataFinal + ".pdf";
        headers.add("Content-Disposition", "inline; filename=" + nomeArquivo);

        return ResponseEntity.ok().headers(headers).contentType(MediaType.APPLICATION_PDF).body(new InputStreamResource(pdf));
    }

    /**
     * Endpoint para gerar o relatório de estoque atual em formato PDF.
     * URL: GET /relatorios/estoque/pdf
     */
    @GetMapping(value = "/estoque/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<InputStreamResource> gerarRelatorioEstoquePdf() {

        // 1. Busca os dados do estoque usando o ProdutoService.
        RelatorioEstoqueDTO dadosRelatorio = produtoService.gerarRelatorioEstoque();

        // 2. Passa os dados para o RelatorioService que gera o PDF.
        ByteArrayInputStream pdf = relatorioService.gerarPdfEstoque(dadosRelatorio);

        // 3. Configura os cabeçalhos da resposta para o download.
        HttpHeaders headers = new HttpHeaders();
        String nomeArquivo = "relatorio_estoque_" + LocalDate.now() + ".pdf";
        headers.add("Content-Disposition", "inline; filename=" + nomeArquivo);

        // 4. Retorna o PDF.
        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdf));
    }
}