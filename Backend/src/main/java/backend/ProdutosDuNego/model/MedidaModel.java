package backend.ProdutosDuNego.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Medida")
public class MedidaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "med_id")
    private Long id;

    @NotBlank(message = "O nome da medida é obrigatório")
    @Size(max = 20, message = "O nome da medida deve ter no máximo 20 caracteres")
    @Column(name = "med_nome", length = 20, nullable = false)
    private String nome;

    @Column(name = "med_ativo", nullable = false)
    private boolean ativo = true;

}
