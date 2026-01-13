package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record UsuarioComEnderecoDTO(
        @NotNull @Valid
        UsuarioCreateDTO usuario,

        @NotNull @Valid
        EnderecoDTO endereco
) {}