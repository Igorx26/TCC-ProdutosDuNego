package backend.ProdutosDuNego.rest.dto;

import java.math.BigDecimal;

public record VendaItemResponseDTO(
        Long idProduto,
        String nomeProduto,
        BigDecimal quantidade,
        BigDecimal valorUnitario,
        BigDecimal subTotal
) {}