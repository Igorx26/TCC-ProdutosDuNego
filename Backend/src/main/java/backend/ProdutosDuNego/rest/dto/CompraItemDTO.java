package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;


public record CompraItemDTO(

        @NotNull(message = "O ID do produto é obrigatório")
        Long idProduto,

        @NotNull(message = "O ID do fornecedor é obrigatório")
        Long idFornecedor,

        @NotNull(message = "A quantidade é obrigatória")
        @Positive(message = "A quantidade deve ser um número positivo")
        BigDecimal quantidade,

        @NotNull(message = "O valor unitário é obrigatório")
        @Positive(message = "O valor unitário deve ser um número positivo")
        BigDecimal valorUnitario
) {}