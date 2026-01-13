package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record VendaAjusteDTO(
        @PositiveOrZero(message = "O desconto não pode ser negativo")
        BigDecimal desconto,

        String observacaoDesconto,

        @PositiveOrZero(message = "O acréscimo não pode ser negativo")
        BigDecimal acrescimo,

        String observacaoAcrescimo
) {}