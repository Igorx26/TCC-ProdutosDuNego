package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProdutoDTO(
        Long id,

        @NotBlank(message = "O nome do produto é obrigatório")
        @Size(max = 50)
        String nome,

        @Size(max = 255)
        String descricao,

        @Size(max = 255)
        String observacao,

        @NotNull(message = "O valor é obrigatório")
        @Positive(message = "O valor deve ser positivo")
        BigDecimal valor,

        @NotNull(message = "O estoque é obrigatório")
        @PositiveOrZero(message = "O estoque não pode ser negativo")
        BigDecimal estoque,

        String imagem,

        // IDs das entidades relacionadas
        @NotNull(message = "O ID da categoria é obrigatório")
        Long idCategoria,

        @NotNull(message = "O ID da medida é obrigatório")
        Long idMedida,

        boolean ativo
) {}