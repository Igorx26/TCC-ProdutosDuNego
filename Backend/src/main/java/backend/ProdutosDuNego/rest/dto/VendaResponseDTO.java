package backend.ProdutosDuNego.rest.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record VendaResponseDTO(
        Long id,
        LocalDateTime dataHora,
        String descricaoStatus,
        BigDecimal totalBruto,
        BigDecimal desconto,
        BigDecimal acrescimo,
        BigDecimal totalLiquido,
        String nomeCliente,
        EnderecoResponseDTO endereco,
        List<VendaItemResponseDTO> itens,
        FormaPagamentoDTO formaPagamento
) {}