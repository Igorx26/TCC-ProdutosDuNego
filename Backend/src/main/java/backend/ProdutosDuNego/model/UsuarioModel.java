package backend.ProdutosDuNego.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.br.CPF;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Usuario")
public class UsuarioModel implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usu_id")
    private Long id;

    @NotBlank(message = "O username é obrigatório")
    @Size(max = 20, message = "O username deve ter no máximo 20 caracteres")
    @Column(name = "usu_nome_usuario", nullable = false, unique = true, length = 20)
    private String nomeUsuario;

    @NotBlank(message = "A senha é obrigatória")
    @Column(name = "usu_senha", nullable = false)
    private String senha; // Armazenaremos o hash BCrypt aqui, que é longo

    @CPF(message = "CPF inválido")
    @Column(name = "usu_cpf", unique = true, length = 14)
    private String cpf;

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 20, message = "O nome deve ter no máximo 20 caracteres")
    @Column(name = "usu_nome", nullable = false, length = 20)
    private String nome;

    @NotBlank(message = "O sobrenome é obrigatório")
    @Size(max = 50, message = "O sobrenome deve ter no máximo 50 caracteres")
    @Column(name = "usu_sobrenome", nullable = false, length = 50)
    private String sobrenome;

    @Past(message = "A data de nascimento deve ser no passado")
    @Column(name = "usu_data_nascimento")
    private LocalDate dataNascimento;

    @NotBlank(message = "O celular é obrigatório")
    @Size(max = 11, min = 11, message = "O celular deve ter 11 caracteres")
    @Column(name = "usu_celular", nullable = false, length = 11)
    private String celular;

    @Size(max = 30, message = "O email deve ter no máximo 30 caracteres")
    @Column(name = "usu_email", length = 30)
    private String email;

    @Column(name = "usu_data_cadastro", nullable = false, updatable = false)
    private LocalDateTime dataCadastro;

    @Column(name = "usu_ultimo_login")
    private LocalDateTime ultimoLogin;

    @Column(name = "usu_ativo", nullable = false)
    private boolean ativo = true;

    @Column(name = "usu_admin", nullable = false)
    private boolean admin = false;

    // Método para garantir que a data de cadastro seja preenchida na criação
    @PrePersist
    protected void onCreate() {
        this.dataCadastro = LocalDateTime.now();
    }

    // --- MÉTODOS DA INTERFACE USERDETAILS ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Este método define as "permissões" ou "papéis" (Roles) do usuário.
        // É crucial para a autorização (decidir o que um usuário PODE ou NÃO PODE fazer).
        if (this.admin) {
            // Se o usuário é admin, ele tem as permissões de ADMIN e de USER.
            return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_USER"));
        } else {
            // Se for um usuário comum, ele tem apenas a permissão de USER.
            return List.of(new SimpleGrantedAuthority("ROLE_USER"));
        }
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        // Este método deve retornar o campo que você usa para login, neste caso, o username.
        return this.nomeUsuario;
    }

    @Override
    public boolean isAccountNonExpired() {
        // Para nosso sistema, a conta nunca expira. Retornamos true.
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // A conta nunca é bloqueada por tentativas de login, etc. Retornamos true.
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        // As credenciais (senha) nunca expiram. Retornamos true.
        return true;
    }

    @Override
    public boolean isEnabled() {
        // Este método diz se o usuário está ativo ou não.
        // Nós o conectamos diretamente ao nosso campo 'ativo'.
        // Se um usuário sofrer um "soft delete" (ativo=false), ele não conseguirá mais logar.
        return this.ativo;
    }
}
