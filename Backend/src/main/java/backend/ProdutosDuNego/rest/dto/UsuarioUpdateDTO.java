package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateDTO(
        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 20)
        String nome,

        @NotBlank(message = "O sobrenome é obrigatório")
        @Size(max = 50)
        String sobrenome,

        @NotBlank(message = "O celular é obrigatório")
        String celular,

        @Email(message = "Email inválido")
        String email
) {}