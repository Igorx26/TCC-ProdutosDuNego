package backend.ProdutosDuNego.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.br.CNPJ;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Fornecedor")
public class FornecedorModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "for_id")
    private Long id;

    @Size(max = 50, message = "O nome da empresa deve ter no máximo 50 caracteres")
    @Column(name = "for_empresa", length = 50)
    private String empresa;

    @Column(name = "for_cnpj", length = 20, unique = true)
    private String cnpj;

    @Column(name = "for_telefone_empresa", length = 11)
    private String telefoneEmpresa;

    @NotBlank(message = "O nome do vendedor é obrigatório")
    @Size(max = 50, message = "O nome do vendedor deve ter no máximo 255 caracteres")
    @Column(name = "for_nome_vendedor", length = 50, nullable = false)
    private String nomeVendedor;

    @NotBlank(message = "Celular do vendedor é obrigatório")
    @Size(max = 11, min = 11, message = "O celular deve ter 11 caracteres")
    @Column(name = "for_celular_vendedor", length = 11, nullable = false)
    private String celularVendedor;

    @Size(max = 30, message = "Email deve ter no máximo 50 caracteres")
    @Column(name = "for_email", length = 30)
    private String email;

    @Column(name = "for_ativo", nullable = false)
    private boolean ativo = true;
}
