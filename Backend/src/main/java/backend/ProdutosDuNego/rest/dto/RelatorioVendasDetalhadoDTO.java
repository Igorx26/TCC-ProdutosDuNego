package backend.ProdutosDuNego.rest.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RelatorioVendasDetalhadoDTO(
        LocalDate dataInicial,
        LocalDate dataFinal,
        String statusFiltrado,
        Long totalDeVendas,
        BigDecimal valorTotalBruto,
        BigDecimal valorTotalDescontos,
        BigDecimal valorTotalAcrescimos,
        BigDecimal valorTotalLiquido,
        List<VendaDetalheDTO> vendas
) {}