package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginDTO(
        @NotBlank
        String nomeUsuario,
        @NotBlank
        String senha
) {}