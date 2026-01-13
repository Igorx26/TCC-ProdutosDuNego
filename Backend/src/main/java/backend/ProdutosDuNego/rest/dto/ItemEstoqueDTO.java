package backend.ProdutosDuNego.rest.dto;

import java.math.BigDecimal;

/**
 * DTO para representar uma única linha no relatório de estoque.
 */
public record ItemEstoqueDTO(
        Long idProduto,
        String nomeProduto,
        BigDecimal quantidadeEmEstoque,
        BigDecimal valorUnitario,
        BigDecimal valorTotalEmEstoque
) {}