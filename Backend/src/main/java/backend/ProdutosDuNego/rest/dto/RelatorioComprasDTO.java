package backend.ProdutosDuNego.rest.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

// O DTO principal do relatório agora contém uma lista de itens detalhados
public record RelatorioComprasDTO(
        LocalDate dataInicial,
        LocalDate dataFinal,
        Long totalDeItensComprados,
        BigDecimal valorTotalGasto,
        List<CompraItemDetalheDTO> compras // A lista de todas as compras no período
) {}