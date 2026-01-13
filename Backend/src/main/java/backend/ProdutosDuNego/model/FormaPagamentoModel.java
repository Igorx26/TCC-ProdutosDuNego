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
@Table(name = "FormaPagamento")
public class FormaPagamentoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fop_id")
    private Long id;

    @NotBlank(message = "Descrição é obrigatória")
    @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
    @Column(name = "fop_descricao", length = 255, nullable = false)
    private String descricao;

    @Column(name = "fop_ativo", nullable = false)
    private boolean ativo = true;

}
