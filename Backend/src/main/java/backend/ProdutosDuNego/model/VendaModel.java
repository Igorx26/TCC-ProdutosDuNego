package backend.ProdutosDuNego.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Venda")
public class VendaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ven_id")
    private Long id;

    @CreationTimestamp
    @Column(name = "ven_data_hora", updatable = false)
    private LocalDateTime dataHora;

    @Column(name = "ven_entrega")
    private boolean isEntrega;

    @Column(name = "ven_total_bruto", precision = 10, scale = 2)
    private BigDecimal totalBruto;

    @Column(name = "ven_desconto", precision = 10, scale = 2)
    private BigDecimal desconto = BigDecimal.ZERO;

    @Column(name = "ven_observacao_desconto")
    private String observacaoDesconto;

    @Column(name = "ven_acrescimo", precision = 10, scale = 2)
    private BigDecimal acrescimo = BigDecimal.ZERO;

    @Column(name = "ven_observacao_acrescimo")
    private String observacaoAcrescimo;

    @Column(name = "ven_total_liquido", precision = 10, scale = 2)
    private BigDecimal totalLiquido;

    @FutureOrPresent(message = "A data para entrega não pode ser no passado.")
    @Column(name = "ven_data_para_entrega")
    private LocalDate dataParaEntrega;

    @Column(name = "ven_hora_para_entrega")
    private LocalTime horaParaEntrega;

    @Column(name = "ven_observacao_cliente")
    private String observacaoCliente;

    @Column(name = "ven_data_hora_da_entrega")
    private LocalDateTime dataHoraDaEntrega;

    @Column(name = "ven_data_hora_pagamento")
    private LocalDateTime dataHoraPagamento;


    @Column(name = "sta_id", nullable = false)
    private Long idStatus;

    @Column(name = "fop_id")
    private Long idFormaPagamento;

    @Column(name = "usuend_id")
    private Long idUsuarioEndereco;


    @OneToMany(mappedBy = "venda", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VendaItemModel> itens = new ArrayList<>();
}