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
@Table(name = "Status")
public class StatusModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sta_id")
    private Long id;

    @NotBlank(message = "Descrição é obrigatória")
    @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
    @Column(name = "sta_descricao", length = 255, nullable = false)
    private String descricao;

    @Column(name = "sta_ativo", nullable = false)
    private boolean ativo = true;
}
