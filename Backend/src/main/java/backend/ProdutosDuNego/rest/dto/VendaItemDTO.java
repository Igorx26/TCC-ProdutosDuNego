package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record VendaItemDTO(
        @NotNull(message = "O ID do produto é obrigatório")
        Long idProduto,

        @NotNull(message = "A quantidade é obrigatória")
        @Positive(message = "A quantidade deve ser maior que zero")
        BigDecimal quantidade
) {}