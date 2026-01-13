package backend.ProdutosDuNego.rest.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

// Este DTO representa uma única linha na nossa nova tabela de relatório
public record CompraItemDetalheDTO(
        Long idCompra,
        LocalDate data,
        String nomeProduto,
        String nomeFornecedor,
        BigDecimal quantidade,
        BigDecimal valorUnitario,
        BigDecimal totalItem
) {}