package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FormaPagamentoDTO(
        Long id,
        @NotBlank(message = "A descrição é obrigatória")
        @Size(max = 255)
        String descricao,
        Boolean ativo
) {}