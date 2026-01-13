package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FornecedorDTO(
        Long id,

        @Size(max = 50)
        String empresa,

        String cnpj,

        @Size(max = 11)
        String telefoneEmpresa,

        @NotBlank(message = "O nome do vendedor é obrigatório")
        @Size(max = 50)
        String nomeVendedor,

        @NotBlank(message = "O celular do vendedor é obrigatório")
        @Size(max = 11, min = 11, message = "O celular deve ter 11 caracteres")
        String celularVendedor,

        @Size(max = 30)
        String email,

        boolean ativo
) {}