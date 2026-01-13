package backend.ProdutosDuNego.rest.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO principal que contém todos os dados do Relatório de Estoque.
 */
public record RelatorioEstoqueDTO(
        int totalDeProdutos,
        BigDecimal valorTotalGeralDoEstoque,
        List<ItemEstoqueDTO> itens
) {}