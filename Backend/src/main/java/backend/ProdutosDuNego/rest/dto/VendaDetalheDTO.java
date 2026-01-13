package backend.ProdutosDuNego.rest.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VendaDetalheDTO(
        Long idVenda,
        LocalDateTime data,
        String nomeCliente,
        BigDecimal totalBruto,
        BigDecimal desconto,
        BigDecimal acrescimo,
        BigDecimal totalLiquido, // Renomeado de 'total'
        String status
) {}