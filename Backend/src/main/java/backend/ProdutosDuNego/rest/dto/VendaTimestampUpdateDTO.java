package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record VendaTimestampUpdateDTO(
        @NotNull(message = "A data e hora são obrigatórias.")
        LocalDateTime timestamp
) {}