package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

// Este DTO representa o corpo da requisição para ADICIONAR um endereço a um usuário
public record UsuarioEnderecoCreateDTO(

        @NotNull(message = "Os dados do endereço são obrigatórios")
        @Valid // Garante que as validações dentro do EnderecoDTO também sejam executadas
        EnderecoDTO endereco,

        Boolean isPrincipal
) {}