package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EnderecoDTO(
        @NotBlank @Size(max = 255)
        String logradouro,
        @NotBlank @Size(max = 10)
        String numero,
        @Size(max = 60)
        String complemento,
        @NotBlank @Size(max = 50)
        String bairro,
        @NotBlank @Size(max = 50)
        String cidade,
        @NotBlank @Size(max = 2)
        String uf,
        @NotBlank @Size(max = 8)
        String cep

) {}