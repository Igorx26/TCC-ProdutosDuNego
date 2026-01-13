package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MedidaDTO(
        Long id,

        @NotBlank(message = "O nome da medida é obrigatório")
        @Size(max = 20)
        String nome,
        boolean ativo
) {}