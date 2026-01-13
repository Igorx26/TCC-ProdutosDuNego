package backend.ProdutosDuNego.rest.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UsuarioResponseDTO(
        Long id,
        String nomeUsuario,
        String nome,
        String sobrenome,
        LocalDate dataNascimento,
        String celular,
        String email,
        LocalDateTime dataCadastro,
        LocalDateTime ultimoLogin,
        boolean admin
) {}