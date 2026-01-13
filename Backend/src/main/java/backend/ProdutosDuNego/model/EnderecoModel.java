package backend.ProdutosDuNego.model;

import backend.ProdutosDuNego.model.enums.UnidadeFederativa; // <-- Importa o novo enum
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Endereco")
public class EnderecoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "end_id")
    private Long id;

    @NotBlank(message = "Logradouro é obrigatório")
    @Size(max = 255, message = "Logradouro deve ter no máximo 255 caracteres")
    @Column(name = "end_logradouro", length = 255, nullable = false)
    private String logradouro;

    @NotBlank(message = "Número é obrigatório")
    @Size(max = 10, message = "Número deve ter no máximo 10 caracteres")
    @Column(name = "end_numero", length = 10, nullable = false)
    private String numero;

    @Column(name = "end_complemento", length = 60)
    private String complemento;

    @NotBlank(message = "Bairro é obrigatório")
    @Size(max = 50, message = "Bairro deve ter no máximo 50 caracteres")
    @Column(name = "end_bairro", length = 50, nullable = false)
    private String bairro;

    @NotBlank(message = "Cidade é obrigatória")
    @Size(max = 50, message = "Cidade deve ter no máximo 50 caracteres")
    @Column(name = "end_cidade", length = 50, nullable = false)
    private String cidade;

    @NotNull(message = "UF é obrigatória")
    @Column(name = "end_uf", length = 2, nullable = false)
    @Enumerated(EnumType.STRING)
    private UnidadeFederativa uf;

    @NotBlank(message = "CEP é obrigatório")
    @Size(max = 8, message = "CEP deve ter no máximo 8 caracteres")
    @Column(name = "end_cep", length = 8, nullable = false)
    private String cep;

}