package backend.ProdutosDuNego.rest.dto;

import java.math.BigDecimal;
import java.time.LocalDate;


public record RelatorioVendasDTO(
        LocalDate dataInicial,
        LocalDate dataFinal,
        Long totalDeVendas,
        BigDecimal valorTotalBruto,
        BigDecimal valorTotalDescontos,
        BigDecimal valorTotalAcrescimos,
        BigDecimal valorTotalLiquido
) {}