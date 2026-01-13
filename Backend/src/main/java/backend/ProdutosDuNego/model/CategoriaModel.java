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
@Table(name = "Categoria")
public class CategoriaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cat_id")
    private Long id;

    @NotBlank(message = "O nome da categoria é obrigatório")
    @Size(max = 50, message = "O nome da categoria deve ter no máximo 50 caracteres")
    @Column(name = "cat_nome", length = 50, nullable = false)
    private String nome;

    @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres")
    @Column(name = "cat_descricao", length = 255)
    private String descricao;

    @Column(name = "cat_ativo", nullable = false)
    private boolean ativo = true ;
}
