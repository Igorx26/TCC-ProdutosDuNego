package backend.ProdutosDuNego.rest.dto;

import jakarta.persistence.Column;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VendaDTO {

    private Long id;
    private LocalDateTime dataHora;
    private boolean entrega;
    private BigDecimal total;
    private Long idStatus;
    private Long idFormaPagamento;
    private Long idUsuarioEnderece;


}
