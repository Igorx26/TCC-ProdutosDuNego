package backend.ProdutosDuNego.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "CompraItem")
public class CompraItemModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "com_id")
    private Long id;


    @NotNull(message = "O valor do item na compra é obrigatório")
    @Positive(message = "O valor deve ser positivo")
    @Column(name = "com_valor", nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;


    @NotNull(message = "A quantidade do item na compra é obrigatória")
    @Positive(message = "A quantidade deve ser positiva")
    @Column(name = "com_quantidade", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantidade;


    @NotNull(message = "O total do item na compra é obrigatório")
    @Positive(message = "O total deve ser positivo")
    @Column(name = "com_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;


    @CreationTimestamp
    @Column(name = "com_data", nullable = false, updatable = false)
    private LocalDate data;


    @NotNull(message = "O ID do produto é obrigatório")
    @Column(name = "pro_id", nullable = false)
    private Long idProduto;


    @NotNull(message = "O ID do fornecedor é obrigatório")
    @Column(name = "for_id", nullable = false)
    private Long idFornecedor;
}