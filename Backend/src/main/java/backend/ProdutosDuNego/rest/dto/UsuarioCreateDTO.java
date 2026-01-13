package backend.ProdutosDuNego.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;


@Data
public class UsuarioCreateDTO {

    @NotBlank(message = "O username é obrigatório")
    @Size(max = 20)
    private String nomeUsuario;

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
    private String senha;

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 20)
    private String nome;

    @NotBlank(message = "O sobrenome é obrigatório")
    @Size(max = 50)
    private String sobrenome;

    @CPF(message = "CPF inválido")
    private String cpf;

    @NotBlank(message = "O celular é obrigatório")
    private String celular;

    @Email(message = "Email inválido")
    private String email;

    @Past(message = "A data de nascimento deve ser uma data no passado")
    private LocalDate dataNascimento;

}