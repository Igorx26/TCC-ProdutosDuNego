package backend.ProdutosDuNego.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "VendaItem")
public class VendaItemModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "venitem_id")
    private Long id;

    @Column(name = "venitem_valor", nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "venitem_quantidade", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantidade;

    @Column(name = "pro_id", nullable = false)
    private Long idProduto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ven_id", nullable = false)
    private VendaModel venda;
}