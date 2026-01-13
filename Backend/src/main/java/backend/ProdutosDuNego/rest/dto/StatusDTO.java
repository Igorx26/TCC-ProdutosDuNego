package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StatusDTO(
        Long id,

        @NotBlank(message = "A descrição é obrigatória")
        @Size(max = 255)
        String descricao,

        boolean ativo
) {}