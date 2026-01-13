package backend.ProdutosDuNego.rest.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProdutoResponseDTO(
        Long id,
        String nome,
        String descricao,
        String observacao,
        BigDecimal valor,
        BigDecimal estoque,
        String imagem,
        LocalDateTime dataCadastro,
        boolean ativo,
        Long idCategoria,
        Long idMedida,

        // Nomes das entidades relacionadas para exibição
        String nomeCategoria,
        String nomeMedida
) {}