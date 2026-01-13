package backend.ProdutosDuNego.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Produto")
public class ProdutoModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pro_id")
    private Long id;

    @NotBlank(message = "O nome do produto é obrigatório")
    @Size(max = 50, message = "O nome do produto deve ter no máximo 50 caracteres")
    @Column(name = "pro_nome", length = 50, nullable = false)
    private String nome;

    @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres")
    @Column(name = "pro_descricao")
    private String descricao;

    @Size(max = 255, message = "A observação deve ter no máximo 255 caracteres")
    @Column(name = "pro_observacao")
    private String observacao;

    @Positive(message = "O valor deve ser positivo")
    @Column(name = "pro_valor", nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @PositiveOrZero(message = "O estoque não pode ser negativo")
    @Column(name = "pro_estoque", nullable = false, precision = 10, scale = 2)
    private BigDecimal estoque = BigDecimal.ZERO;

    @Lob
    @Column(name = "pro_imagem")
    @JdbcTypeCode(SqlTypes.VARBINARY)
    private byte[] imagem;

    @CreationTimestamp
    @Column(name = "pro_data_cadastro", nullable = false, updatable = false)
    private LocalDateTime dataCadastro;

    @Column(name = "pro_ativo", nullable = false)
    private boolean ativo = true;

    @Column(name = "cat_id", nullable = false)
    private Long idCategoria;

    @Column(name = "med_id", nullable = false)
    private Long idMedida;

}
